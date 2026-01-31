-- Seed data for Yonsei Korean Vocabulary (Representative Sample)
-- This file adds ~60 words across Levels 1-6 to the dictionary_entries table.

INSERT INTO
    dictionary_entries (
        korean,
        romaja,
        pos,
        definition,
        example_sentence,
        example_meaning,
        difficulty_level
    )
VALUES

-- Level 1 (Beginner)
(
    '학생',
    'haksaeng',
    'Noun',
    '学生',
    '저는 연세대학교 학생입니다.',
    '我是延世大学的学生。',
    'Level 1'
),
(
    '학교',
    'hakgyo',
    'Noun',
    '学校',
    '학교에 갑니다.',
    '去学校。',
    'Level 1'
),
(
    '공부하다',
    'gongbuhada',
    'Verb',
    '学习',
    '도서관에서 공부해요.',
    '在图书馆学习。',
    'Level 1'
),
(
    '친구',
    'chingu',
    'Noun',
    '朋友',
    '친구를 만나요.',
    '见朋友。',
    'Level 1'
),
(
    '선생님',
    'seonsaengnim',
    'Noun',
    '老师',
    '선생님, 안녕하세요?',
    '老师，您好？',
    'Level 1'
),
(
    '책',
    'chaek',
    'Noun',
    '书',
    '책을 읽어요.',
    '看书。',
    'Level 1'
),
(
    '가방',
    'gabang',
    'Noun',
    '包',
    '가방이 무거워요.',
    '包很重。',
    'Level 1'
),
(
    '먹다',
    'meokda',
    'Verb',
    '吃',
    '밥을 먹어요.',
    '吃饭。',
    'Level 1'
),
(
    '마시다',
    'masida',
    'Verb',
    '喝',
    '물을 마셔요.',
    '喝水。',
    'Level 1'
),
(
    '자다',
    'jada',
    'Verb',
    '睡觉',
    '집에서 자요.',
    '在家睡觉。',
    'Level 1'
),

-- Level 2 (Beginner)
(
    '교통',
    'gyotong',
    'Noun',
    '交通',
    '이곳은 교통이 편리해요.',
    '这里的交通很方便。',
    'Level 2'
),
(
    '갈아타다',
    'garatada',
    'Verb',
    '换乘',
    '시청역에서 지하철을 갈아타세요.',
    '请在市厅站换乘地铁。',
    'Level 2'
),
(
    '약속',
    'yaksok',
    'Noun',
    '约定/约会',
    '친구와 약속이 있어요.',
    '我和朋友有约。',
    'Level 2'
),
(
    '문화',
    'munhwa',
    'Noun',
    '文化',
    '한국 문화를 배우고 싶어요.',
    '我想学习韩国文化。',
    'Level 2'
),
(
    '여행',
    'yeohaeng',
    'Noun',
    '旅行',
    '제주도로 여행을 가요.',
    '去济州岛旅行。',
    'Level 2'
),
(
    '사진',
    'sajin',
    'Noun',
    '照片',
    '사진을 찍어도 돼요?',
    '可以拍照吗？',
    'Level 2'
),
(
    '취미',
    'chwimi',
    'Noun',
    '爱好',
    '제 취미는 영화 감상이에요.',
    '我的爱好是看电影。',
    'Level 2'
),
(
    '편지',
    'pyeonji',
    'Noun',
    '信',
    '부모님께 편지를 썼어요.',
    '给父母写了信。',
    'Level 2'
),
(
    '부치다',
    'buchida',
    'Verb',
    '寄/送',
    '우체국에서 소포를 부쳤어요.',
    '在邮局寄了包裹。',
    'Level 2'
),
(
    '찾다',
    'chatda',
    'Verb',
    '寻找/查找',
    '길을 찾고 있어요.',
    '正在找路。',
    'Level 2'
),

-- Level 3 (Intermediate)
(
    '성격',
    'seonggyeok',
    'Noun',
    '性格',
    '그 친구는 성격이 좋아요.',
    '那个朋友性格很好。',
    'Level 3'
),
(
    '경험',
    'gyeongheom',
    'Noun',
    '经验/经历',
    '다양한 경험을 하고 싶어요.',
    '想拥有各种各样的经历。',
    'Level 3'
),
(
    '실수',
    'silsu',
    'Noun',
    '失误',
    '실수를 통해 배울 수 있어요.',
    '可以从失误中学习。',
    'Level 3'
),
(
    '해결하다',
    'haegyeolhada',
    'Verb',
    '解决',
    '문제를 해결했어요.',
    '解决了问题。',
    'Level 3'
),
(
    '참여하다',
    'chamyeohada',
    'Verb',
    '参与',
    '봉사 활동에 참여했어요.',
    '参与了志愿者活动。',
    'Level 3'
),
(
    '환경',
    'hwangyeong',
    'Noun',
    '环境',
    '환경 보호가 중요해요.',
    '环境保护很重要。',
    'Level 3'
),
(
    '오염',
    'oyeom',
    'Noun',
    '污染',
    '공기 오염이 심각해요.',
    '空气污染很严重。',
    'Level 3'
),
(
    '절약하다',
    'jeoryakhada',
    'Verb',
    '节约',
    '물을 절약해야 해요.',
    '必须节约用水。',
    'Level 3'
),
(
    '습관',
    'seupgwan',
    'Noun',
    '习惯',
    '좋은 습관을 기르세요.',
    '请养成好习惯。',
    'Level 3'
),
(
    '스트레스',
    'seuteureseu',
    'Noun',
    '压力',
    '스트레스를 풀어요.',
    '缓解压力。',
    'Level 3'
),

-- Level 4 (Intermediate)
(
    '면접',
    'myeonjeop',
    'Noun',
    '面试',
    '내일 회사 면접이 있어요.',
    '明天有公司面试。',
    'Level 4'
),
(
    '자격증',
    'jagyeokjeung',
    'Noun',
    '资格证',
    '운전면허 자격증을 땄어요.',
    '考到了驾照。',
    'Level 4'
),
(
    '전공',
    'jeongong',
    'Noun',
    '专业',
    '제 전공은 경영학입니다.',
    '我的专业是经营学。',
    'Level 4'
),
(
    '발표',
    'balpyo',
    'Noun',
    '发表/发布',
    '수업 시간에 발표를 했어요.',
    '上课时间做了发表。',
    'Level 4'
),
(
    '보고서',
    'bogoseo',
    'Noun',
    '报告书',
    '보고서를 제출해야 해요.',
    '必须提交报告书。',
    'Level 4'
),
(
    '동료',
    'dongryo',
    'Noun',
    '同事',
    '직장 동료들과 식사했어요.',
    '和职场同事一起吃了饭。',
    'Level 4'
),
(
    '승진',
    'seungjin',
    'Noun',
    '晋升',
    '이번에 과장으로 승진했어요.',
    '这次晋升为科长了。',
    'Level 4'
),
(
    '월급',
    'wolgeup',
    'Noun',
    '月薪',
    '월급을 저축해요.',
    '存月薪。',
    'Level 4'
),
(
    '회의',
    'hoei',
    'Noun',
    '会议',
    '오후에 회의가 있습니다.',
    '下午有会。',
    'Level 4'
),
(
    '출장',
    'chuljang',
    'Noun',
    '出差',
    '부산으로 출장을 가요.',
    '去釜山出差。',
    'Level 4'
),

-- Level 5 (Advanced)
(
    '경제',
    'gyeongje',
    'Noun',
    '经济',
    '한국 경제가 발전하고 있어요.',
    '韩国经济正在发展。',
    'Level 5'
),
(
    '수출',
    'suchul',
    'Noun',
    '出口',
    '자동차를 해외로 수출해요.',
    '向海外出口汽车。',
    'Level 5'
),
(
    '소비',
    'sobi',
    'Noun',
    '消费',
    '소비 심리가 위축되었어요.',
    '消费心理萎缩了。',
    'Level 5'
),
(
    '투자',
    'tuja',
    'Noun',
    '投资',
    '주식에 투자했어요.',
    '投资了股票。',
    'Level 5'
),
(
    '정책',
    'jeongchaek',
    'Noun',
    '政策',
    '새로운 부동산 정책이 나왔어요.',
    '出了新的房地产政策。',
    'Level 5'
),
(
    '정치',
    'jeongchi',
    'Noun',
    '政治',
    '정치에 관심이 많아요.',
    '对政治很感兴趣。',
    'Level 5'
),
(
    '투표',
    'tupyo',
    'Noun',
    '投票',
    '선거일에 투표를 했어요.',
    '选举日投了票。',
    'Level 5'
),
(
    '권리',
    'gwonli',
    'Noun',
    '权利',
    '국민의 권리를 지켜야 해요.',
    '必须维护国民的权利。',
    'Level 5'
),
(
    '의무',
    'uimu',
    'Noun',
    '义务',
    '납세의 의무가 있습니다.',
    '有纳税的义务。',
    'Level 5'
),
(
    '협력',
    'hyeomnyeok',
    'Noun',
    '合作/协作',
    '양국 간의 협력이 필요해요.',
    '需要两国间的合作。',
    'Level 5'
),

-- Level 6 (Advanced)
(
    '철학',
    'cheolhak',
    'Noun',
    '哲学',
    '그의 인생 철학은 독특해요.',
    '他的人生哲学很独特。',
    'Level 6'
),
(
    '문학',
    'munhak',
    'Noun',
    '文学',
    '한국 고전 문학을 공부해요.',
    '学习韩国古典文学。',
    'Level 6'
),
(
    '비평',
    'bipyeong',
    'Noun',
    '批评/评论',
    '영화 비평을 썼어요.',
    '写了电影评论。',
    'Level 6'
),
(
    '상징',
    'sangjing',
    'Noun',
    '象征',
    '비둘기는 평화의 상징이에요.',
    '鸽子是和平的象征。',
    'Level 6'
),
(
    '갈등',
    'galdeung',
    'Noun',
    '矛盾/葛藤',
    '세대 간의 갈등을 해결해야 해요.',
    '必须解决代际矛盾。',
    'Level 6'
),
(
    '조화',
    'johwa',
    'Noun',
    '和谐/造化',
    '자연과의 조화가 중요해요.',
    '与自然的和谐很重要。',
    'Level 6'
),
(
    '포용',
    'poyong',
    'Noun',
    '包容',
    '다양성을 포용해야 합니다.',
    '必须包容多样性。',
    'Level 6'
),
(
    '통찰력',
    'tongchallyeok',
    'Noun',
    '洞察力',
    '그는 뛰어난 통찰력을 가졌어요.',
    '他拥有卓越的洞察力。',
    'Level 6'
),
(
    '정체성',
    'jeongcheseong',
    'Noun',
    '主体性/身份认同',
    '자신의 정체성을 찾고 있어요.',
    '正在寻找自我的身份认同。',
    'Level 6'
),
(
    '가치관',
    'gachigwan',
    'Noun',
    '价值观',
    '사람마다 가치관이 달라요.',
    '每个人的价值观都不同。',
    'Level 6'
);