export const BODY_SHAPE_OPTIONS = [
    { code: 'normal', name: '보통' },
    { code: 'slim', name: '슬림' },
    { code: 'chubby', name: '통통' },
    { code: 'obese', name: '비만' },
    { code: 'muscular', name: '근육질' },
    { code: 'thin', name: '마름' },
];

export const EDUCATION_OPTIONS = [
    { code: 'middle', name: '중졸' },
    { code: 'high', name: '고졸' },
    { code: 'college', name: '대졸' },
    { code: 'master_c', name: '석사수료' },
    { code: 'master', name: '석사졸업' },
    { code: 'doctor_c', name: '박사수료' },
    { code: 'doctor', name: '박사졸업' },
];

export const SMOKING_OPTIONS = [
    { code: 'SMOKER', name: '흡연' },
    { code: 'NON_SMOKER', name: '비흡연' },
    { code: 'QUITTING', name: '금연중 (금연 1년 미만)' },
];

export const DRINKING_FREQ_OPTIONS = [
    { code: 'yearly', name: '매년' },
    { code: 'monthly', name: '매달' },
    { code: 'weekly', name: '매주' },
    { code: 'none', name: '안함' },
];

export const DRINKING_TYPE_OPTIONS = [
    { code: 'kaoliang', name: '고량주' },
    { code: 'whiskey', name: '위스키' },
    { code: 'soju', name: '소주' },
    { code: 'beer', name: '맥주' },
    { code: 'wine', name: '와인' },
    { code: 'traditional', name: '전통주' },
    { code: 'cocktail', name: '칵테일/하이볼' },
];

export const DIET_OPTIONS = [
    { code: 'spicy', name: '매운음식' },
    { code: 'fried', name: '튀김' },
    { code: 'korean', name: '한식' },
    { code: 'chinese', name: '중식' },
    { code: 'japanese', name: '일식' },
    { code: 'salad', name: '샐러드' },
    { code: 'noodle', name: '면요리' },
];

export const JOB_TYPE_STATUS_OPTIONS = [
    { code: 'employee', name: '직장인' },
    { code: 'business', name: '사업자' },
];

export const JOB_OPTIONS = [
    { code: 'IT_DEV', name: 'IT/개발' },
    { code: 'OFFICE', name: '사무직/일반' },
    { code: 'SALES', name: '영업/마케팅' },
    { code: 'DESIGN', name: '디자인/예술' },
    { code: 'MD_RETAIL', name: '기획/유통' },
    { code: 'HOSPITAL', name: '의료/병역' },
    { code: 'EDUCATE', name: '교육/강사' },
    { code: 'CIVIL', name: '공무원/공사' },
    { code: 'FREELANCE', name: '프리랜서' },
    { code: 'SPECIAL', name: '전문직(사)' },
    { code: 'STUDENT', name: '학생' },
    { code: 'ETC', name: '기타/직접입력' }
];

export const REGION_OPTIONS = [
    { code: 'SEOUL', name: '서울' },
    { code: 'GYEONGGI', name: '경기' },
    { code: 'INCHEON', name: '인천' },
    { code: 'DAEJEON', name: '대전광역시' },
    { code: 'DAEGU', name: '대구광역시' },
    { code: 'BUSAN', name: '부산광역시' },
    { code: 'ULSAN', name: '울산광역시' },
    { code: 'GWANGJU', name: '광주광역시' },
    { code: 'GANGWON', name: '강원도' },
    { code: 'CHUNGBUK', name: '충청북도' },
    { code: 'CHUNGNAM', name: '충청남도' },
    { code: 'GYEONGBUK', name: '경상북도' },
    { code: 'GYEONGNAM', name: '경상남도' },
    { code: 'JEONBUK', name: '전라북도' },
    { code: 'JEONNAM', name: '전라남도' },
    { code: 'JEJU', name: '제주도' },
];

export const SUBREGION_OPTIONS = {
    SEOUL: [
        { code: 'GANGNAM', name: '강남구' },
        { code: 'GANGDONG', name: '강동구' },
        { code: 'GANGBUK', name: '강북구' },
        { code: 'GANGSEO', name: '강서구' },
        { code: 'GWANAK', name: '관악구' },
        { code: 'GWANGJIN', name: '광진구' },
        { code: 'GURO', name: '구로구' },
        { code: 'GEUMCHEON', name: '금천구' },
        { code: 'NOWON', name: '노원구' },
        { code: 'DOBONG', name: '도봉구' },
        { code: 'DONGDAEMUN', name: '동대문구' },
        { code: 'DONGJAK', name: '동작구' },
        { code: 'MAPO', name: '마포구' },
        { code: 'SEODAEMUN', name: '서대문구' },
        { code: 'SEOCHO', name: '서초구' },
        { code: 'SEONGDONG', name: '성동구' },
        { code: 'SEONGBUK', name: '성북구' },
        { code: 'SONGPA', name: '송파구' },
        { code: 'YANGCHEON', name: '양천구' },
        { code: 'YEONGDEUNGPO', name: '영등포구' },
        { code: 'YONGSAN', name: '용산구' },
        { code: 'EUNPYEONG', name: '은평구' },
        { code: 'JONGNO', name: '종로구' },
        { code: 'JUNG', name: '중구' },
        { code: 'JUNGRANG', name: '중랑구' },
    ],

    GYEONGGI: [
        { code: 'GOYANG', name: '고양시' },
        { code: 'GWACHEON', name: '과천시' },
        { code: 'GWANGMYEONG', name: '광명시' },
        { code: 'GWANGJU', name: '광주시' },
        { code: 'GURI', name: '구리시' },
        { code: 'GUNPO', name: '군포시' },
        { code: 'GIMPO', name: '김포시' },
        { code: 'NAMYANGJU', name: '남양주시' },
        { code: 'DONGDUCHEON', name: '동두천시' },
        { code: 'BUCHEON', name: '부천시' },
        { code: 'SEONGNAM', name: '성남시' },
        { code: 'SUWON', name: '수원시' },
        { code: 'SIHEUNG', name: '시흥시' },
        { code: 'ANSAN', name: '안산시' },
        { code: 'ANSEONG', name: '안성시' },
        { code: 'ANYANG', name: '안양시' },
        { code: 'YANGJU', name: '양주시' },
        { code: 'OSAN', name: '오산시' },
        { code: 'YONGIN', name: '용인시' },
        { code: 'UIWANG', name: '의왕시' },
        { code: 'UIJEONGBU', name: '의정부시' },
        { code: 'ICHEON', name: '이천시' },
        { code: 'PAJU', name: '파주시' },
        { code: 'PYEONGTAEK', name: '평택시' },
        { code: 'POCHEON', name: '포천시' },
        { code: 'HANAM', name: '하남시' },
        { code: 'HWASEONG', name: '화성시' },
        { code: 'GAPYEONG', name: '가평군' },
        { code: 'YANGPYEONG', name: '양평군' },
        { code: 'YEOJU', name: '여주군' },
        { code: 'YEONCHEON', name: '연천군' },
    ],

    INCHEON: [
        { code: 'GYEYANG', name: '계양구' },
        { code: 'MICHUHOL', name: '미추홀구' },
        { code: 'NAMDONG', name: '남동구' },
        { code: 'DONG', name: '동구' },
        { code: 'BUPYEONG', name: '부평구' },
        { code: 'SEO', name: '서구' },
        { code: 'YEONSU', name: '연수구' },
        { code: 'JUNG', name: '중구' },
        { code: 'GANGHWA', name: '강화군' },
        { code: 'ONGJIN', name: '옹진군' },
    ],

    DAEJEON: [
        { code: 'DAEDEOK', name: '대덕구' },
        { code: 'DONG', name: '동구' },
        { code: 'SEO', name: '서구' },
        { code: 'YUSEONG', name: '유성구' },
        { code: 'JUNG', name: '중구' },
    ],

    DAEGU: [
        { code: 'NAM', name: '남구' },
        { code: 'DALSEO', name: '달서구' },
        { code: 'DONG', name: '동구' },
        { code: 'BUK', name: '북구' },
        { code: 'SEO', name: '서구' },
        { code: 'SUSEONG', name: '수성구' },
        { code: 'JUNG', name: '중구' },
        { code: 'DALSEONG', name: '달성군' },
    ],

    BUSAN: [
        { code: 'GANGSEO', name: '강서구' },
        { code: 'GEUMJEONG', name: '금정구' },
        { code: 'NAM', name: '남구' },
        { code: 'DONG', name: '동구' },
        { code: 'DONGNAE', name: '동래구' },
        { code: 'BUSANJIN', name: '부산진구' },
        { code: 'BUK', name: '북구' },
        { code: 'SASANG', name: '사상구' },
        { code: 'SAHA', name: '사하구' },
        { code: 'SEO', name: '서구' },
        { code: 'SUYEONG', name: '수영구' },
        { code: 'YEONJE', name: '연제구' },
        { code: 'YEONGDO', name: '영도구' },
        { code: 'JUNG', name: '중구' },
        { code: 'HAEUNDAE', name: '해운대구' },
        { code: 'GIJANG', name: '기장군' },
    ],

    ULSAN: [
        { code: 'NAM', name: '남구' },
        { code: 'DONG', name: '동구' },
        { code: 'BUK', name: '북구' },
        { code: 'JUNG', name: '중구' },
        { code: 'ULJU', name: '울주군' },
    ],

    GWANGJU: [
        { code: 'GWANGSAN', name: '광산구' },
        { code: 'NAM', name: '남구' },
        { code: 'DONG', name: '동구' },
        { code: 'BUK', name: '북구' },
        { code: 'SEO', name: '서구' },
    ],

    GANGWON: [
        { code: 'GANGNEUNG', name: '강릉시' },
        { code: 'DONGHAE', name: '동해시' },
        { code: 'SAMCHEOK', name: '삼척시' },
        { code: 'SOKCHO', name: '속초시' },
        { code: 'WONJU', name: '원주시' },
        { code: 'CHUNCHEON', name: '춘천시' },
        { code: 'TAEBAEK', name: '태백시' },
        { code: 'GOSEONG', name: '고성군' },
        { code: 'YANGGU', name: '양구군' },
        { code: 'YANGYANG', name: '양양군' },
        { code: 'YEONGWOL', name: '영월군' },
        { code: 'INJE', name: '인제군' },
        { code: 'JEONGSEON', name: '정선군' },
        { code: 'CHEORWON', name: '철원군' },
        { code: 'PYEONGCHANG', name: '평창군' },
        { code: 'HONGCHEON', name: '홍천군' },
        { code: 'HWACHEON', name: '화천군' },
        { code: 'HOENGSEONG', name: '횡성군' },
    ],

    CHUNGBUK: [
        { code: 'JECHEON', name: '제천시' },
        { code: 'CHEONGJU', name: '청주시' },
        { code: 'CHUNGJU', name: '충주시' },
        { code: 'GOESAN', name: '괴산군' },
        { code: 'DANYANG', name: '단양군' },
        { code: 'BOEUN', name: '보은군' },
        { code: 'YEONGDONG', name: '영동군' },
        { code: 'OKCHEON', name: '옥천군' },
        { code: 'EUMSEONG', name: '음성군' },
        { code: 'JEUNGPYEONG', name: '증평군' },
        { code: 'JINCHEON', name: '진천군' },
        { code: 'CHEONGWON', name: '청원군' },
    ],

    CHUNGNAM: [
        { code: 'GYERYONG', name: '계룡시' },
        { code: 'GONGJU', name: '공주시' },
        { code: 'NONSAN', name: '논산시' },
        { code: 'BORYEONG', name: '보령시' },
        { code: 'SEOSAN', name: '서산시' },
        { code: 'ASAN', name: '아산시' },
        { code: 'CHEONAN', name: '천안시' },
        { code: 'GEUMSAN', name: '금산군' },
        { code: 'DANGJIN', name: '당진군' },
        { code: 'BUYEO', name: '부여군' },
        { code: 'SEOCHEON', name: '서천군' },
        { code: 'YEONGI', name: '연기군' },
        { code: 'YESAN', name: '예산군' },
        { code: 'CHEONGYANG', name: '청양군' },
        { code: 'TAEAN', name: '태안군' },
        { code: 'HONGSEONG', name: '홍성군' },
    ],

    GYEONGBUK: [
        { code: 'GYEONGSAN', name: '경산시' },
        { code: 'GYEONGJU', name: '경주시' },
        { code: 'GUMI', name: '구미시' },
        { code: 'GIMCHEON', name: '김천시' },
        { code: 'MUNGYEONG', name: '문경시' },
        { code: 'SANGJU', name: '상주시' },
        { code: 'ANDONG', name: '안동시' },
        { code: 'YEONGJU', name: '영주시' },
        { code: 'YEONGCHEON', name: '영천시' },
        { code: 'POHANG', name: '포항시' },
        { code: 'GORYEONG', name: '고령군' },
        { code: 'GUNWI', name: '군위군' },
        { code: 'BONGHWA', name: '봉화군' },
        { code: 'SEONGJU', name: '성주군' },
        { code: 'YEONGDEOK', name: '영덕군' },
        { code: 'YEONGYANG', name: '영양군' },
        { code: 'YECHEON', name: '예천군' },
        { code: 'ULLEUNG', name: '울릉군' },
        { code: 'ULJIN', name: '울진군' },
        { code: 'UISEONG', name: '의성군' },
        { code: 'CHEONGDO', name: '청도군' },
        { code: 'CHEONGSONG', name: '청송군' },
        { code: 'CHILGOK', name: '칠곡군' },
    ],

    GYEONGNAM: [
        { code: 'GEOJE', name: '거제시' },
        { code: 'GIMHAE', name: '김해시' },
        { code: 'MASAN', name: '마산시' },
        { code: 'MILYANG', name: '밀양시' },
        { code: 'SACHEON', name: '사천시' },
        { code: 'YANGSAN', name: '양산시' },
        { code: 'JINJU', name: '진주시' },
        { code: 'JINHAE', name: '진해시' },
        { code: 'CHANGWON', name: '창원시' },
        { code: 'TONGYEONG', name: '통영시' },
        { code: 'GEOCHANG', name: '거창군' },
        { code: 'GOSEONG', name: '고성군' },
        { code: 'NAMHAE', name: '남해군' },
        { code: 'SANCHEONG', name: '산청군' },
        { code: 'UIRYEONG', name: '의령군' },
        { code: 'CHANGNYEONG', name: '창녕군' },
        { code: 'HADONG', name: '하동군' },
        { code: 'HAMAN', name: '함안군' },
        { code: 'HAMYANG', name: '함양군' },
        { code: 'HAPCHEON', name: '합천군' },
    ],

    JEONBUK: [
        { code: 'GUNSAN', name: '군산시' },
        { code: 'GIMJE', name: '김제시' },
        { code: 'NAMWON', name: '남원시' },
        { code: 'IKSAN', name: '익산시' },
        { code: 'JEONJU', name: '전주시' },
        { code: 'JEONGEUP', name: '정읍시' },
        { code: 'GOCHANG', name: '고창군' },
        { code: 'MUJU', name: '무주군' },
        { code: 'BUAN', name: '부안군' },
        { code: 'SUNCHANG', name: '순창군' },
        { code: 'WANJU', name: '완주군' },
        { code: 'IMSIL', name: '임실군' },
        { code: 'JANGSU', name: '장수군' },
        { code: 'JINAN', name: '진안군' },
    ],

    JEONNAM: [
        { code: 'GWANGYANG', name: '광양시' },
        { code: 'NAJU', name: '나주시' },
        { code: 'MOKPO', name: '목포시' },
        { code: 'SUNCHEON', name: '순천시' },
        { code: 'YEOSU', name: '여수시' },
        { code: 'GANGJIN', name: '강진군' },
        { code: 'GOHEUNG', name: '고흥군' },
        { code: 'GOKSEONG', name: '곡성군' },
        { code: 'GURYE', name: '구례군' },
        { code: 'DAMYANG', name: '담양군' },
        { code: 'MUAN', name: '무안군' },
        { code: 'BOSEONG', name: '보성군' },
        { code: 'SINAN', name: '신안군' },
        { code: 'YEONGGWANG', name: '영광군' },
        { code: 'YEONGAM', name: '영암군' },
        { code: 'WANDO', name: '완도군' },
        { code: 'JANGSEONG', name: '장성군' },
        { code: 'JANGHEUNG', name: '장흥군' },
        { code: 'JINDO', name: '진도군' },
        { code: 'HAMPYEONG', name: '함평군' },
        { code: 'HAENAM', name: '해남군' },
        { code: 'HWASUN', name: '화순군' },
    ],

    JEJU: [
        { code: 'SEOGWIPO', name: '서귀포시' },
        { code: 'JEJU', name: '제주시' },
    ],
};

export const RELIGION_OPTIONS = [
    { code: 'NONE', name: '무교' },
    { code: 'CHRISTIAN', name: '기독교' },
    { code: 'CATHOLIC', name: '천주교' },
    { code: 'BUDDHISM', name: '불교' },
    { code: 'OTHER', name: '기타' }
];

export const POLITICS_OPTIONS = [
    { code: 'NEUTRAL', name: '무관심' },
    { code: 'CONSERVATIVE', name: '보수' },
    { code: 'LIBERAL', name: '진보' },
    { code: 'MODERATE', name: '중도' }
];

export const ASSET_OPTIONS = [
    { code: 'OWN_HOME', name: '자가보유' },
    { code: 'OWN_CAR', name: '차량보유' },
    { code: 'STOCKS', name: '주식' },
    { code: 'LESS_1_B', name: '1억 미만' },
    { code: '1_3_B', name: '1억~3억' },
    { code: '3_5_B', name: '3억~5억' },
    { code: '5_10_B', name: '5~10억' },
    { code: '10_B_PLUS', name: '10억 이상' },
];

export const STOCK_OPTIONS = [
    { code: 'NONE', name: '안함' },
    { code: 'GROWTH', name: '성장주' },
    { code: 'VALUE', name: '가치주' },
    { code: 'DIVIDEND', name: '배당주' },
    { code: 'ETF', name: '지수(ETF)' },
    { code: 'KOSPI', name: '국내주식' },
    { code: 'US', name: '미국주식' },
    { code: 'COIN', name: '코인' },
    { code: 'SHORT', name: '단기매매' },
    { code: 'LONG', name: '장기투자' }
];

export const SALARY_BEHAVIOR_OPTIONS = [
    { code: 'save_first', name: '먼저 저축·투자를 하고 남는 범위에서 소비해요' },
    { code: 'spend_first', name: '필요한 만큼 쓰고 남으면 저축하는 편이에요' },
    { code: 'no_plan', name: '계획 없이 쓰는 편이에요' },
];

export const DATE_EXPENSE_OPTIONS = [
    { code: 'RICH_PAY', name: '여유 있는 사람이 조금 더 부담하는 편이 좋아요' },
    { code: 'DUTCH', name: '정확하게 더치페이 하는 편이 좋아요' },
    { code: 'ALTERNATE', name: '번갈아 가며 자연스럽게 부담하는 편이 좋아요' },
];

export const MARRIAGE_PLAN_OPTIONS = [
    { code: 'NO', name: '아니오' },
    { code: 'YES', name: '네' },
    { code: 'DISCUSS', name: '상대방과 충분히 상의 후 결정하고 싶어요' },
];

export const INVESTMENT_IDEA_OPTIONS = [
    { code: 'ACTIVE', name: '실제로 투자하고 있는 편이에요' },
    { code: 'STABLE', name: '안정적인 예·적금을 선호해요' },
    { code: 'NONE_YET', name: '현재 투자하고 있지는 않아요' },
    { code: 'NO_INTEREST', name: '재테크에 큰 관심은 없어요' },
];

export const YES_NO_OPTIONS = [
    { code: 'Y', name: '예' },
    { code: 'N', name: '아니오' }
];
