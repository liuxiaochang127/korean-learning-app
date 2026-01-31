-- ============================================
-- 样例数据 (Sample Data)
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 1. 课程数据 (Courses)
INSERT INTO
    public.courses (
        id,
        title,
        subtitle,
        level_category,
        cover_url,
        total_chapters
    )
VALUES (
        'c1a1a1a1-1111-1111-1111-111111111111',
        '延世韩国语 1',
        '연세 한국어 1',
        '初级',
        'https://picsum.photos/200/300?random=1',
        10
    ),
    (
        'c2a2a2a2-2222-2222-2222-222222222222',
        '延世韩国语 2',
        '연세 한국어 2',
        '初级',
        'https://picsum.photos/200/300?random=2',
        10
    ),
    (
        'c3a3a3a3-3333-3333-3333-333333333333',
        '延世韩国语 3',
        '연세 한국어 3',
        '中级',
        'https://picsum.photos/200/300?random=3',
        10
    ),
    (
        'c4a4a4a4-4444-4444-4444-444444444444',
        '延世韩国语 4',
        '연세 한국어 4',
        '中级',
        'https://picsum.photos/200/300?random=4',
        10
    );

-- 2. 章节数据 (Chapters) - 延世韩国语 3
INSERT INTO
    public.chapters (
        course_id,
        chapter_number,
        title,
        korean_title,
        description
    )
VALUES (
        'c3a3a3a3-3333-3333-3333-333333333333',
        1,
        '第1课：成语',
        '제1과: 성어',
        '学习韩语成语和俗语'
    ),
    (
        'c3a3a3a3-3333-3333-3333-333333333333',
        2,
        '第2课：旅行',
        '제2과: 여행',
        '旅行相关词汇和表达'
    ),
    (
        'c3a3a3a3-3333-3333-3333-333333333333',
        3,
        '第3课：韩国的节日',
        '제3과: 한국의 명절',
        '韩国传统节日'
    ),
    (
        'c3a3a3a3-3333-3333-3333-333333333333',
        4,
        '第4课：大学生活',
        '제4과: 대학 생활',
        '大学生活相关表达'
    );

-- 3. 词典词条 (Dictionary Entries)
INSERT INTO
    public.dictionary_entries (
        korean,
        romaja,
        pos,
        definition,
        example_sentence,
        example_meaning,
        difficulty_level
    )
VALUES (
        '학교',
        'hak-gyo',
        'Noun',
        '学校 (School)',
        '학교에 가요.',
        '我去学校。',
        'Level 1'
    ),
    (
        '가다',
        'ga-da',
        'Verb',
        '去 (To go)',
        '집에 가다.',
        '回家。',
        'Level 1'
    ),
    (
        '예쁘다',
        'ye-ppeu-da',
        'Adjective',
        '漂亮 (To be pretty)',
        '꽃이 예쁘다.',
        '花很漂亮。',
        'Level 1'
    ),
    (
        '사랑',
        'sa-rang',
        'Noun',
        '爱 (Love)',
        '사랑해요.',
        '我爱你。',
        'Level 1'
    ),
    (
        '공부하다',
        'gong-bu-ha-da',
        'Verb',
        '学习 (To study)',
        '한국어를 공부하다.',
        '学习韩语。',
        'Level 1'
    ),
    (
        '친구',
        'chin-gu',
        'Noun',
        '朋友 (Friend)',
        '친구를 만나요.',
        '见朋友。',
        'Level 1'
    ),
    (
        '맛있다',
        'ma-sit-da',
        'Adjective',
        '好吃 (To be delicious)',
        '이 김치가 맛있어요.',
        '这个泡菜很好吃。',
        'Level 1'
    ),
    (
        '책',
        'chaek',
        'Noun',
        '书 (Book)',
        '책을 읽어요.',
        '读书。',
        'Level 1'
    ),
    (
        '선생님',
        'seon-saeng-nim',
        'Noun',
        '老师 (Teacher)',
        '선생님께서 가르쳐요.',
        '老师在教。',
        'Level 1'
    ),
    (
        '대학교',
        'dae-hak-gyo',
        'Noun',
        '大学 (University)',
        '대학교에 다녀요.',
        '我上大学。',
        'Level 1'
    ),
    (
        '기다리다',
        'gi-da-ri-da',
        'Verb',
        '等待 (To wait)',
        '친구를 기다려요.',
        '等朋友。',
        'Level 2'
    ),
    (
        '도서관',
        'do-seo-gwan',
        'Noun',
        '图书馆 (Library)',
        '도서관에서 공부해요.',
        '在图书馆学习。',
        'Level 1'
    ),
    (
        '행복하다',
        'haeng-bok-ha-da',
        'Adjective',
        '幸福 (To be happy)',
        '나는 행복해요.',
        '我很幸福。',
        'Level 2'
    ),
    (
        '여행',
        'yeo-haeng',
        'Noun',
        '旅行 (Travel)',
        '여행을 가요.',
        '去旅行。',
        'Level 2'
    ),
    (
        '음식',
        'eum-sik',
        'Noun',
        '食物 (Food)',
        '한국 음식을 좋아해요.',
        '喜欢韩国食物。',
        'Level 1'
    );

-- 4. 抽认卡 (Flashcards) - 成语卡片
INSERT INTO
    public.flashcards (
        chapter_id,
        front_text,
        back_text,
        back_meaning,
        example_sentence,
        is_grammar
    )
VALUES (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第1课：成语'
            LIMIT 1
        ),
        '작심삼일',
        '三天打鱼两天晒网',
        '比喻决心不持久，做事半途而废',
        '나의 다이어트는 항상 작심삼일로 끝난다.',
        false
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第1课：成语'
            LIMIT 1
        ),
        '백문이불여일견',
        '百闻不如一见',
        '听别人说一百次不如亲眼看一次',
        '백문이불여일견이라고 직접 가서 봐야 해요.',
        false
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第1课：成语'
            LIMIT 1
        ),
        '고생 끝에 낙이 온다',
        '苦尽甘来',
        '经过艰苦努力后会有好结果',
        '포기하지 마세요. 고생 끝에 낙이 옵니다.',
        false
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第1课：成语'
            LIMIT 1
        ),
        '시간이 금이다',
        '时间就是金钱',
        '时间非常宝贵',
        '시간이 금이니까 빨리 해요.',
        false
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第1课：成语'
            LIMIT 1
        ),
        '눈코 뜰 새 없다',
        '忙得不可开交',
        '非常忙碌，没有任何空闲',
        '요즘 일이 많아서 눈코 뜰 새 없어요.',
        false
    );

-- 5. 语法抽认卡 (Grammar Flashcards)
INSERT INTO
    public.flashcards (
        chapter_id,
        front_text,
        back_text,
        back_meaning,
        example_sentence,
        is_grammar
    )
VALUES (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第3课：韩国的节日'
            LIMIT 1
        ),
        '-는 바람에',
        '因为...（导致不好的结果）',
        '表示原因,通常导致消极结果',
        '비가 오는 바람에 소풍을 못 갔어요.',
        true
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第4课：大学生活'
            LIMIT 1
        ),
        '-느라고',
        '因为忙于...',
        '表示因为做某事而导致的结果',
        '공부하느라고 잠을 못 잤어요.',
        true
    ),
    (
        (
            SELECT id
            FROM public.chapters
            WHERE
                title = '第2课：旅行'
            LIMIT 1
        ),
        '-기로 하다',
        '决定做...',
        '表示决定',
        '이번 주말에 여행을 가기로 했어요.',
        true
    );

-- 查看插入的数据
SELECT 'Courses' as table_name, COUNT(*) as count
FROM public.courses
UNION ALL
SELECT 'Chapters', COUNT(*)
FROM public.chapters
UNION ALL
SELECT 'Dictionary', COUNT(*)
FROM public.dictionary_entries
UNION ALL
SELECT 'Flashcards', COUNT(*)
FROM public.flashcards;