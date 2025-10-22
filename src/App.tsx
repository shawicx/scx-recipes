import "./styles/globals.css";

function App() {
  return (
    <div className="container">
      <p>这是一个"智能健康饮食推荐系统"的整体设计方案。该方案将融合用户画像、地域文化、地理位置服务（LBS）和营养健康知识，打造一个个性化、实用且可扩展的工具。</p>
      
      <hr />
      <h2>一、系统目标</h2>
      <p>为用户提供<strong>个性化、本地化、健康化</strong>的一日三餐推荐，兼顾口味偏好、营养均衡、地域特色与实际可获取性。</p>
      
      <hr />
      <h2>二、核心模块设计</h2>
      
      <h3>1. <strong>用户画像模块</strong></h3>
      <ul>
        <li><strong>基础信息</strong>：省份/城市、年龄、性别、身高体重（用于计算BMR基础代谢率）</li>
        <li><strong>饮食偏好</strong>：忌口（如素食、清真、过敏源）、口味偏好（辣/甜/咸/清淡）、饮食习惯（如不吃早餐、夜宵偏好）</li>
        <li><strong>健康目标</strong>：减脂、增肌、控糖、日常维持等（可选）</li>
      </ul>
      <p>参考健康饮食系统设计，可集成BMR计算与热量摄入建议。</p>
      
      <h3>2. <strong>地域饮食知识库</strong></h3>
      <ul>
        <li>构建一个<strong>中国各省份特色饮食数据库</strong>，包含：</li>
        <li>早餐：如武汉热干面、兰州牛肉面、广东肠粉</li>
        <li>午餐/晚餐：如北京烤鸭、重庆小面、粤式烧腊</li>
        <li>按气候、文化、食材季节性进行分类，支持动态调整推荐策略</li>
      </ul>
      
      <h3>3. <strong>地理位置服务（LBS）模块</strong></h3>
      <ul>
        <li>通过用户授权获取<strong>实时地理位置</strong></li>
        <li>对接地图API（如高德、百度）获取<strong>周边餐饮商家/外卖选项</strong></li>
        <li>支持"堂食""外卖""自炊"三种模式：</li>
        <li>若选"自炊"，推荐可购买食材的菜市场或超市</li>
        <li>若选"外卖/堂食"，直接推荐附近符合偏好的餐馆</li>
      </ul>
      
      <h3>4. <strong>营养与健康引擎</strong></h3>
      <ul>
        <li>集成营养数据库（如中国食物成分表）</li>
        <li>每日推荐需满足：</li>
        <li>热量控制（基于BMR和活动量）</li>
        <li>营养均衡（蛋白质、碳水、脂肪、维生素比例）</li>
        <li>三餐分配合理（如早餐30%、午餐40%、晚餐30%）</li>
        <li>可结合用户健康目标动态调整（如减脂期降低碳水）</li>
      </ul>
      
      <h3>5. <strong>智能推荐算法</strong></h3>
      <ul>
        <li><strong>混合推荐策略</strong>：</li>
        <li><strong>基于内容的推荐</strong>：根据用户画像匹配地域菜系和营养标签</li>
        <li><strong>协同过滤</strong>：参考相似用户的选择（需积累数据后启用）</li>
        <li><strong>知识图谱</strong>：构建"食材-菜品-营养-地域"关系图，提升推理能力</li>
        <li>初期可采用规则引擎 + 简单加权评分，后期引入机器学习模型。</li>
      </ul>
      
      <h3>6. <strong>交互与反馈机制</strong></h3>
      <ul>
        <li>用户可对推荐结果"点赞/踩"、标记"已吃""不想吃"</li>
        <li>系统根据反馈动态优化后续推荐</li>
        <li>支持手动替换某餐选项（如"把晚餐换成川菜"）</li>
      </ul>
      
      <hr />
      <h2>三、技术架构建议</h2>
      <ul>
        <li><strong>前端</strong>：移动端App或微信小程序（便于定位和日常使用）</li>
        <li><strong>后端</strong>：RESTful API（Spring Boot / Django / Flask/ Nestjs）</li>
        <li><strong>数据库</strong>：
          <ul>
            <li>用户数据：MySQL / PostgreSQL</li>
            <li>菜品/营养数据：MongoDB（灵活结构）或图数据库（如Neo4j，用于知识图谱）</li>
          </ul>
        </li>
        <li><strong>第三方服务</strong>：
          <ul>
            <li>地图API（高德/百度）用于LBS</li>
            <li>天气API（可选，用于季节性调整，如夏天推荐凉面）</li>
          </ul>
        </li>
        <li><strong>部署</strong>：云服务（阿里云、腾讯云），支持弹性扩展</li>
      </ul>
      
      <hr />
      <h2>四、用户体验流程示例</h2>
      <ol>
        <li>用户首次使用 → 填写基本信息（省份、年龄、偏好、目标）</li>
        <li>系统请求位置权限 → 获取当前城市/区</li>
        <li>每日早晨推送早餐推荐（如"广州用户：推荐肠粉+豆浆，附近3家店可外卖"）</li>
        <li>午餐前1小时推送午餐选项（结合上午活动量调整热量）</li>
        <li>用户可随时手动刷新或调整偏好</li>
      </ol>
      
      <hr />
      <h2>五、扩展方向</h2>
      <ul>
        <li>加入<strong>节气/节日推荐</strong>（如冬至饺子、端午粽子）</li>
        <li>支持<strong>家庭多人模式</strong>（为孩子、老人定制不同菜单）</li>
        <li>与智能厨房设备联动（如推荐菜谱并发送到智能烤箱）</li>
        <li>引入<strong>碳足迹计算</strong>，推荐更可持续的饮食选择</li>
      </ul>
    </div>
  );
}

export default App;
