
import { supabase } from '@/lib/supabaseClient';

export interface DictionaryEntry {
    id: string;
    korean: string;
    romaja?: string;
    pos: string;
    definition: string;
    example_sentence?: string;
    example_meaning?: string;
    is_starred?: boolean; // 关联自 user_favorites
}

export interface Flashcard {
    id: string;
    front_text: string;
    back_text: string;
    back_meaning?: string;
    example_sentence?: string;
    is_grammar?: boolean;
}

export interface Course {
    id: string;
    title: string;
    subtitle?: string;
    level_category?: string;
    cover_url?: string;
    total_chapters: number;
    progress?: number; // 关联自 user_courses
    status?: string;
}

export interface UserWordProgress {
    id: string;
    word_id: string;
    ease_factor: number;
    interval: number;
    review_count: number;
    next_review_at: string;
    status: 'new' | 'learning' | 'review' | 'relearning';
    last_review_quality?: number; // 0-3
}

export interface GrammarPoint {
    id: string;
    title: string;
    description: string;
    example_korean: string;
    example_translation: string;
    level: string;
}

export interface StudyItem extends DictionaryEntry {
    progress?: UserWordProgress;
    isNew: boolean;
}

export const api = {
    // 词典相关
    async addDictionaryEntry(entry: Omit<DictionaryEntry, 'id'>): Promise<DictionaryEntry | null> {
        // 如果可能，尝试附加当前用户ID，以确保RLS策略允许将来的编辑
        const { data: { user } } = await supabase.auth.getUser();
        const payload = user ? { ...entry, user_id: user.id } : entry;

        const { data, error } = await supabase
            .from('dictionary_entries')
            .insert(payload)
            .select();

        if (error) {
            console.error('Error adding dictionary entry:', error);
            throw error;
        }
        return data?.[0] || null;
    },

    async updateDictionaryEntry(id: string, updates: Partial<DictionaryEntry>): Promise<DictionaryEntry | null> {
        const { data, error } = await supabase
            .from('dictionary_entries')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating dictionary entry:', error);
            throw error;
        }

        // 优化：检测静默的RLS失败
        if (!data || data.length === 0) {
            throw new Error('更新失败：可能是权限不足（只能修改自己创建的单词）或记录不存在。');
        }

        return data[0];
    },

    async deleteDictionaryEntry(id: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('dictionary_entries')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error deleting dictionary entry:', error);
            throw error;
        }

        // 优化：检测静默的RLS失败
        if (!data || data.length === 0) {
            throw new Error('删除失败：可能是权限不足（只能删除自己创建的单词）或记录不存在。');
        }

        return true;
    },

    async searchDictionary(term: string): Promise<DictionaryEntry[]> {
        if (!term) return [];

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('dictionary_entries')
            .select('*')
            .or(`korean.ilike.%${term}%,definition.ilike.%${term}%`)
            .limit(20);

        if (error) {
            console.error('Error searching dictionary:', error);
            return [];
        }

        let results = data || [];

        // 如果用户已登录，检查收藏状态
        if (user && results.length > 0) {
            const ids = results.map(r => r.id);
            const { data: favorites } = await supabase
                .from('user_favorites')
                .select('entry_id')
                .eq('user_id', user.id)
                .in('entry_id', ids);

            const favoriteIds = new Set(favorites?.map(f => f.entry_id));
            results = results.map(r => ({
                ...r,
                is_starred: favoriteIds.has(r.id)
            }));
        }

        return results;
    },

    async getRecentWords(limit: number = 20): Promise<DictionaryEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('dictionary_entries')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent words:', error);
            return [];
        }

        let results = data || [];

        if (user && results.length > 0) {
            const ids = results.map(r => r.id);
            const { data: favorites } = await supabase
                .from('user_favorites')
                .select('entry_id')
                .eq('user_id', user.id)
                .in('entry_id', ids);

            const favoriteIds = new Set(favorites?.map(f => f.entry_id));
            results = results.map(r => ({
                ...r,
                is_starred: favoriteIds.has(r.id)
            }));
        }

        return results;
    },

    async getCategories(): Promise<string[]> {
        // 从 dictionary_entries 获取不同的词性
        // 注意：Supabase JS 客户端不直接支持 .distinct()。
        // 考虑到数据集较小，我们在客户端处理或者使用 RPC。
        // 目前采用客户端过滤。

        const { data, error } = await supabase
            .from('dictionary_entries')
            .select('pos')
            .order('pos');

        if (error) return ['All', 'Noun', 'Verb', 'Adjective']; // 降级方案

        const unique = Array.from(new Set(data?.map(item => item.pos).filter(Boolean)));
        return ['All', ...unique];
    },

    async getFavorites(userId: string): Promise<DictionaryEntry[]> {
        const { data, error } = await supabase
            .from('user_favorites')
            .select(`
        entry_id,
        dictionary_entries (*)
      `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error getting favorites:', error);
            return [];
        }

        // 扁平化结果
        return data?.map((item: any) => item.dictionary_entries) || [];
    },

    async toggleFavorite(userId: string, entryId: string, isFavorite: boolean) {
        if (isFavorite) {
            // 移除收藏
            await supabase.from('user_favorites').delete().match({ user_id: userId, entry_id: entryId });
        } else {
            // 添加收藏
            await supabase.from('user_favorites').insert({ user_id: userId, entry_id: entryId });
        }
    },

    // 课程相关
    async getCourses(userId: string): Promise<Course[]> {
        // 获取所有课程并关联用户进度
        // 如果想要一次性获取课程和进度，标准的 Supabase join 比较复杂
        // 更简单的做法：分别获取课程和进度，然后在本地合并
        const { data: courses, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .order('created_at');

        if (courseError) {
            console.error('Error fetching courses:', courseError);
            return [];
        }

        const { data: progress } = await supabase
            .from('user_courses')
            .select('*')
            .eq('user_id', userId);

        const progressMap = new Map(progress?.map(p => [p.course_id, p]) || []);

        return courses.map(course => {
            const p = progressMap.get(course.id);
            return {
                ...course,
                progress: p?.progress_percent || 0,
                status: p?.status || 'locked'
            };
        });
    },

    // 用户概况
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) console.error('Error fetching profile:', error);
        return data;
    },

    async getDictionaryStats(userId: string) {
        // 统计：已学习单词总数（状态不为 'new'），今日需复习数
        const nowISO = new Date().toISOString();

        // 1. 已学数量
        // 简化：状态不是 'new'
        const { count: learnedCount } = await supabase
            .from('user_word_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .neq('status', 'new');

        // 2. 今日需复习
        // 优先检查每日计划是否存在
        const studyDate = this.getLogicalDate();
        const { count: planCount, data: planData } = await supabase
            .from('daily_study_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('study_date', studyDate)
            .eq('status', 'pending');

        let dueCount = 0;

        // 如果每日计划存在（且有未完成的任务），使用它
        // 我们需要知道计划是“已生成”还是只是“已完成”（0个待办）。
        // 检查今日总任务数
        const { count: totalPlanCount } = await supabase
            .from('daily_study_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('study_date', studyDate);

        if (totalPlanCount && totalPlanCount > 0) {
            dueCount = planCount || 0;
        } else {
            // 如果尚未生成，动态退回计算
            const { count: dynamicDue } = await supabase
                .from('user_word_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .lte('next_review_at', nowISO);
            dueCount = dynamicDue || 0;
            // 注意：动态计算不包含今日计划的新词。
            // 但这对于“待复习”来说已经足够近似。
        }

        return {
            learned: learnedCount || 0,
            due: dueCount || 0
        };
    },

    // 抽认卡
    async getFlashcards(chapterId?: string): Promise<Flashcard[]> {
        // 如果没有章节ID，获取随机或演示集合
        let query = supabase.from('flashcards').select('*');

        if (chapterId) {
            query = query.eq('chapter_id', chapterId);
        } else {
            query = query.limit(10);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching flashcards:', error);
            return [];
        }
        return data || [];
    },

    async getVocabularyList(userId: string, page: number = 0, limit: number = 20): Promise<any[]> {
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('dictionary_entries')
            .select(`
                *,
                user_word_progress!left (
                    review_count
                )
            `)
            .range(from, to)
            .order('korean');

        if (error) throw error;

        return data.map((item: any) => ({
            ...item,
            review_count: item.user_word_progress?.[0]?.review_count || 0
        }));
    },

    async incrementReviewCount(userId: string, wordId: string): Promise<number> {
        const { data: existing } = await supabase
            .from('user_word_progress')
            .select('id, review_count')
            .eq('user_id', userId)
            .eq('word_id', wordId)
            .maybeSingle();

        let newCount = 1;

        if (existing) {
            newCount = existing.review_count + 1;
            await supabase
                .from('user_word_progress')
                .update({ review_count: newCount, last_reviewed_at: new Date().toISOString() })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('user_word_progress')
                .insert({
                    user_id: userId,
                    word_id: wordId,
                    review_count: 1,
                    ease_factor: 2.5,
                    interval: 0,
                    status: 'learning',
                    next_review_at: new Date().toISOString(),
                    last_reviewed_at: new Date().toISOString()
                });
        }
        return newCount;
    },

    // SRS 系统 (间隔重复)
    // 获取逻辑日期（凌晨4点变更）
    async getDailyGrammar(count: number = 5): Promise<GrammarPoint[]> {
        const { data: allIds } = await supabase
            .from('grammar_points')
            .select('id');

        if (!allIds || allIds.length === 0) return [];

        const shuffled = [...allIds].sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, count).map(x => x.id);

        const { data: grammars } = await supabase
            .from('grammar_points')
            .select('*')
            .in('id', selectedIds);

        return grammars || [];
    },

    getLogicalDate(): string {
        const now = new Date();
        now.setHours(now.getHours() - 4); // 回退4小时，实现4点刷新
        // 使用本地格式化，确保在中国时区正确工作
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    async getDailyStudySet(userId: string, limit: number = 100, fetchDetails: boolean = true): Promise<{ items: StudyItem[], reviewedToday: number }> {
        const studyDate = this.getLogicalDate();

        // 1. 检查今日任务是否存在
        const { data: existingTasks, error: checkError } = await supabase
            .from('daily_study_tasks')
            .select('*')
            .eq('user_id', userId)
            .eq('study_date', studyDate);

        if (checkError) {
            console.error('Error checking daily tasks:', checkError);
            return { items: [], reviewedToday: 0 };
        }

        let tasks = existingTasks || [];

        // 2. 如果无任务，生成任务（懒生成）
        if (tasks.length === 0) {
            console.log('Generating daily tasks for:', studyDate);

            // A. 获取到期复习 (Due now)
            const nowISO = new Date().toISOString();

            const { data: dueProgress } = await supabase
                .from('user_word_progress')
                .select('*')
                .eq('user_id', userId)
                .lte('next_review_at', nowISO)
                .limit(limit);

            const reviewsToInsert = (dueProgress || []).map(p => ({
                user_id: userId,
                word_id: p.word_id,
                study_date: studyDate,
                status: 'pending',
                task_type: 'review'
            }));

            // B. 填充新词
            const remaining = limit - reviewsToInsert.length;
            let newToInsert: any[] = [];

            if (remaining > 0) {
                // 排除所有已学习或已计划的单词
                const { data: allUserProgress } = await supabase
                    .from('user_word_progress')
                    .select('word_id')
                    .eq('user_id', userId);

                const allProgressIds = allUserProgress?.map(p => p.word_id) || [];

                let query = supabase.from('dictionary_entries').select('id').limit(remaining);
                if (allProgressIds.length > 0) {
                    const safeIds = allProgressIds.slice(0, 800); // 数量上限保护
                    query = query.not('id', 'in', `(${safeIds.join(',')})`);
                }

                const { data: newWords } = await query;

                // 客户端二次检查排除
                const reallyNewWords = (newWords || []).filter(w => !allProgressIds.includes(w.id));

                newToInsert = reallyNewWords.map(w => ({
                    user_id: userId,
                    word_id: w.id,
                    study_date: studyDate,
                    status: 'pending',
                    task_type: 'new'
                }));
            }

            const allTasksToInsert = [...reviewsToInsert, ...newToInsert];

            if (allTasksToInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('daily_study_tasks')
                    .insert(allTasksToInsert);

                if (insertError) console.error('Error inserting tasks:', insertError);

                // 重新获取以获得 ID 并确认
                const { data: inserted } = await supabase
                    .from('daily_study_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('study_date', studyDate);
                tasks = inserted || [];
            }
        }

        const reviewedTodayCount = tasks.filter(t => t.status === 'completed').length;

        // 优化：如果调用者不需要详情（只想确保生成），提前返回
        if (!fetchDetails) {
            return { items: [], reviewedToday: reviewedTodayCount };
        }

        // 3. 填充任务的字典数据和进度数据
        if (tasks.length === 0) return { items: [], reviewedToday: 0 };

        const wordIds = tasks.map(t => t.word_id);

        // 获取单词
        const { data: words } = await supabase
            .from('dictionary_entries')
            .select('*')
            .in('id', wordIds);

        // 获取进度（当前状态）
        const { data: progress } = await supabase
            .from('user_word_progress')
            .select('*')
            .eq('user_id', userId)
            .in('word_id', wordIds);

        const progressMap = new Map(progress?.map(p => [p.word_id, p]));
        const taskMap = new Map(tasks.map(t => [t.word_id, t]));

        const pendingWordIds = new Set(tasks.filter(t => t.status === 'pending').map(t => t.word_id));

        const studyItems: StudyItem[] = (words || [])
            .filter(w => pendingWordIds.has(w.id))
            .map(w => {
                const t = taskMap.get(w.id);
                return {
                    ...w,
                    progress: progressMap.get(w.id),
                    isNew: t?.task_type === 'new'
                };
            });

        return { items: studyItems, reviewedToday: reviewedTodayCount };
    },

    async submitReview(userId: string, wordId: string, quality: 0 | 1 | 2 | 3, currentProgress?: UserWordProgress) {
        // 算法：简化的 Sm-2 算法，微调至分钟级
        // quality: 0=忘记(重来), 1=困难, 2=良好, 3=简单/掌握

        // 新词默认值
        let ease = currentProgress?.ease_factor || 2.5;
        let interval = currentProgress?.interval || 0; // 天数
        let reviewCount = (currentProgress?.review_count || 0) + 1;
        let status = currentProgress?.status || 'new';

        const now = new Date();
        let nextReview = new Date(now);

        if (quality === 0) {
            // 忘记 -> 1 天
            interval = 1;
            status = 'learning';
            ease = Math.max(1.3, ease - 0.2);
            nextReview.setDate(now.getDate() + 1);
        } else if (quality === 1) {
            // 困难 -> 2 天
            interval = 2;
            status = 'learning';
            ease = Math.max(1.3, ease - 0.15);
            nextReview.setDate(now.getDate() + 2);
        } else if (quality === 2) {
            // 良好 -> 基数 5 天
            if (interval < 5) interval = 5;
            else interval = Math.floor(interval * ease);

            status = 'review';
            nextReview.setDate(now.getDate() + interval);
        } else if (quality === 3) {
            // 简单 -> 基数 7 天
            if (interval < 7) interval = 7;
            else interval = Math.floor(interval * ease * 1.3);

            ease += 0.15;
            status = 'review';
            nextReview.setDate(now.getDate() + interval);
        }

        const payload = {
            user_id: userId,
            word_id: wordId,
            ease_factor: ease,
            interval: interval,
            review_count: reviewCount,
            next_review_at: nextReview.toISOString(),
            last_reviewed_at: now.toISOString(),
            status: status
        };

        // 1. 更新长期记忆（进度表）
        const { error: progressError } = await supabase
            .from('user_word_progress')
            .upsert(payload, { onConflict: 'user_id,word_id' });

        if (progressError) console.error('Error submitting review:', progressError);

        // 2. 更新每日任务状态
        if (quality >= 2) {
            const studyDate = this.getLogicalDate();
            const { error: taskError } = await supabase
                .from('daily_study_tasks')
                .update({ status: 'completed' })
                .eq('user_id', userId)
                .eq('word_id', wordId)
                .eq('study_date', studyDate);

            if (taskError) console.error('Error updating task status:', taskError);
        }
    }
};
