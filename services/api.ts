
import { supabase } from '@/lib/supabaseClient';

export interface DictionaryEntry {
    id: string;
    korean: string;
    romaja?: string;
    pos: string;
    definition: string;
    example_sentence?: string;
    example_meaning?: string;
    is_starred?: boolean; // Joined from user_favorites
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
    progress?: number; // Joined from user_courses
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
    // Dictionary
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

        // Check favorites status if user is logged in
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
        // Fetch distinct POS from dictionary_entries
        // Note: supabase .select('pos') with distinct is needed.
        // But supabase-js simple client doesn't support .distinct() directly easily in one go without raw sql or a function usually,
        // but we can try .select('pos') and process client side for now as dataset is small, OR use a stored procedure.
        // Given constraints and small dataset, let's fetch all (or limit) and uniques client side, or just hardcode common ones plus dynamic?
        // Let's try RPC if available, otherwise just fetch a sample.

        // Better: Use a dedicated SQL function or just fetch distinct POS
        // RPC approach is cleaner but requires SQL setup. Let's do raw CSV approach on client for now or hardcoded 'Common' ones + fetched.

        const { data, error } = await supabase
            .from('dictionary_entries')
            .select('pos')
            .order('pos');

        if (error) return ['All', 'Noun', 'Verb', 'Adjective']; // Fallback

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

        // Flatten the result
        return data?.map((item: any) => item.dictionary_entries) || [];
    },

    async toggleFavorite(userId: string, entryId: string, isFavorite: boolean) {
        if (isFavorite) {
            // Remove
            await supabase.from('user_favorites').delete().match({ user_id: userId, entry_id: entryId });
        } else {
            // Add
            await supabase.from('user_favorites').insert({ user_id: userId, entry_id: entryId });
        }
    },

    // Courses
    async getCourses(userId: string): Promise<Course[]> {
        // Fetch all courses and join with user progress
        // This is a bit complex with standard Supabase join if we want all courses + progress
        // Simpler approach: Fetch courses, then fetch progress, merge them locally
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

    // Profile
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
        // Stats: Total words learned (status != 'new'), reviews due today
        const nowISO = new Date().toISOString();

        // 1. Learned Count
        // Simplified: status is not 'new' or 'review_count' > 0
        const { count: learnedCount } = await supabase
            .from('user_word_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .neq('status', 'new');

        // 2. Due Today
        // Check if daily plan exists first
        const studyDate = this.getLogicalDate();
        const { count: planCount, data: planData } = await supabase
            .from('daily_study_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('study_date', studyDate)
            .eq('status', 'pending');

        let dueCount = 0;

        // If daily plan exists (planData is not null/empty check implies we query effectively), use it.
        // Actually count is enough. Wait, if plan doesn't exist, count is 0. 
        // We need to know if the plan *exists* (generated) or is just completed (0 pending).
        // Let's check total tasks for today
        const { count: totalPlanCount } = await supabase
            .from('daily_study_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('study_date', studyDate);

        if (totalPlanCount && totalPlanCount > 0) {
            dueCount = planCount || 0;
        } else {
            // Fallback to dynamic calculation if not generated yet
            const { count: dynamicDue } = await supabase
                .from('user_word_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .lte('next_review_at', nowISO);
            dueCount = dynamicDue || 0;
            // Note: This dynamic due count doesn't include the 'new words' meant for today unless generated.
            // But it's a good enough approximation for "Reviews Due".
            // If we want to show Total Goal (100), we might just show 100 - learnedToday? 
            // But let's stick to "Due Reviews" context.
        }

        return {
            learned: learnedCount || 0,
            due: dueCount || 0
        };
    },

    // Flashcards
    async getFlashcards(chapterId?: string): Promise<Flashcard[]> {
        // If no chapterId, fetch random or demo set
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

    // SRS System
    // Helper to get logical date (changes at 4AM)
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

        // 1. Check if tasks exist for today
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

        // 2. If no tasks, generate them (Lazy Generation)
        if (tasks.length === 0) {
            console.log('Generating daily tasks for:', studyDate);

            // A. Get Due Reviews (Due now)
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

            // B. Fill with New Words
            const remaining = limit - reviewsToInsert.length;
            let newToInsert: any[] = [];

            if (remaining > 0) {
                // Exclude all learned or already scheduled words
                const { data: allUserProgress } = await supabase
                    .from('user_word_progress')
                    .select('word_id')
                    .eq('user_id', userId);

                const allProgressIds = allUserProgress?.map(p => p.word_id) || [];

                let query = supabase.from('dictionary_entries').select('id').limit(remaining);
                if (allProgressIds.length > 0) {
                    const safeIds = allProgressIds.slice(0, 800); // Safety cap
                    query = query.not('id', 'in', `(${safeIds.join(',')})`);
                }

                const { data: newWords } = await query;

                // Double check client side exclusion
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

                // Re-fetch to get IDs and be sure
                const { data: inserted } = await supabase
                    .from('daily_study_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('study_date', studyDate);
                tasks = inserted || [];
            }
        }

        const reviewedTodayCount = tasks.filter(t => t.status === 'completed').length;

        // Optimization: If caller doesn't need details (just wants to ensure generation), return early
        if (!fetchDetails) {
            return { items: [], reviewedToday: reviewedTodayCount };
        }

        // 3. Hydrate tasks with Dictionary and Progress data
        if (tasks.length === 0) return { items: [], reviewedToday: 0 };

        const wordIds = tasks.map(t => t.word_id);

        // Fetch Words
        const { data: words } = await supabase
            .from('dictionary_entries')
            .select('*')
            .in('id', wordIds);

        // Fetch Progress (Current state)
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
        // Algorithm: Simplified Sm-2 with Minute-level adjustments
        // quality: 0=Unknown(Again), 1=Hard, 2=Good, 3=Easy/Master

        // Defaults for new word
        let ease = currentProgress?.ease_factor || 2.5;
        let interval = currentProgress?.interval || 0; // Days
        let reviewCount = (currentProgress?.review_count || 0) + 1;
        let status = currentProgress?.status || 'new';

        const now = new Date();
        let nextReview = new Date(now);

        if (quality === 0) {
            // Forgotten -> 1 Day
            interval = 1;
            status = 'learning';
            ease = Math.max(1.3, ease - 0.2);
            nextReview.setDate(now.getDate() + 1);
        } else if (quality === 1) {
            // Hard -> 2 Days
            interval = 2;
            status = 'learning';
            ease = Math.max(1.3, ease - 0.15);
            nextReview.setDate(now.getDate() + 2);
        } else if (quality === 2) {
            // Good -> 5 Days base
            if (interval < 5) interval = 5;
            else interval = Math.floor(interval * ease);

            status = 'review';
            nextReview.setDate(now.getDate() + interval);
        } else if (quality === 3) {
            // Easy -> 7 Days base
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

        // 1. Update Long-term Memory (Progress)
        const { error: progressError } = await supabase
            .from('user_word_progress')
            .upsert(payload, { onConflict: 'user_id,word_id' });

        if (progressError) console.error('Error submitting review:', progressError);

        // 2. Update Daily Task Status
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
