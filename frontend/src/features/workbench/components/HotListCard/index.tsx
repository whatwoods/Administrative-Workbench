import { useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import './styles.css';

type Platform = 'douyin' | 'baidu' | 'weibo';

interface HotItem {
    id: string;
    rank: number;
    title: string;
    heat: string;
    isHot?: boolean;
}

const mockData: Record<Platform, HotItem[]> = {
    douyin: [
        { id: '1', rank: 1, title: '北交所自查风暴再现', heat: '1145万热度', isHot: true },
        { id: '2', rank: 2, title: '美联储丙烯酸的25个基点', heat: '1136万热度' },
        { id: '3', rank: 3, title: '新技术如何赋能旅游业', heat: '1125万热度' },
        { id: '4', rank: 4, title: '家人这一页应是精彩开放', heat: '1113万热度' },
        { id: '5', rank: 5, title: '请全国爸妈接招的生活小挑战', heat: '1043万热度' },
        { id: '6', rank: 6, title: '据看蛋糕蒸鸡蛋', heat: '1027万热度' },
        { id: '7', rank: 7, title: '杜克开启印度之旅', heat: '915万热度' },
    ],
    baidu: [
        { id: '1', rank: 1, title: '2026春节档电影预售', heat: '892万热度', isHot: true },
        { id: '2', rank: 2, title: '多地迎来降雪天气', heat: '756万热度' },
        { id: '3', rank: 3, title: '新能源汽车销量创新高', heat: '634万热度' },
    ],
    weibo: [
        { id: '1', rank: 1, title: '#明星婚讯#', heat: '1.2亿', isHot: true },
        { id: '2', rank: 2, title: '#春节返乡高峰#', heat: '8956万' },
        { id: '3', rank: 3, title: '#年货节开启#', heat: '6723万' },
    ]
};

const platformLabels: Record<Platform, string> = {
    douyin: '抖音',
    baidu: '百度',
    weibo: '微博'
};

export default function HotListCard() {
    const [activePlatform, setActivePlatform] = useState<Platform>('douyin');

    const hotItems = mockData[activePlatform];

    const getRankClass = (rank: number) => {
        if (rank <= 3) return `rank-${rank}`;
        return '';
    };

    return (
        <div className="hotlist-card glass-card">
            <div className="card-header">
                <div className="header-title">
                    <Flame size={18} className="fire-icon" />
                    <h3>热榜中心</h3>
                </div>
            </div>

            {/* 平台切换 */}
            <div className="platform-tabs">
                {(Object.keys(platformLabels) as Platform[]).map((platform) => (
                    <button
                        key={platform}
                        className={`platform-tab ${activePlatform === platform ? 'active' : ''}`}
                        onClick={() => setActivePlatform(platform)}
                    >
                        {platformLabels[platform]}
                    </button>
                ))}
            </div>

            {/* 热榜列表 */}
            <div className="hotlist-content">
                {hotItems.map((item) => (
                    <div key={item.id} className="hot-item">
                        <span className={`hot-rank ${getRankClass(item.rank)}`}>
                            {item.rank}
                        </span>
                        <div className="hot-info">
                            <span className="hot-title">{item.title}</span>
                            <span className="hot-heat">
                                <Flame size={12} />
                                {item.heat}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 小红书标识 */}
            <div className="hotlist-footer">
                <span className="xiaohongshu-badge">小红书</span>
            </div>
        </div>
    );
}
