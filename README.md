[Udemy - Modern React with Redux](https://www.udemy.com/course/react-redux/learn/lecture/12531346#overview)

- 本章節重點：youtube API / 處理 array response

# 04 - youtube app

- 製作有 search 功能和播放功能的影片瀏覽頁（串接 youtube API）

## 資源

1. [semantic-ui](https://semantic-ui.com/elements/list.html)
2. [YouTube API](https://developers.google.com/youtube/v3/docs/search/list) 

## 執行步驟

1. 先區分各個 component 組成：
這次專案會有：SearchBar / VideoDetail / VideoList(VideoItem)
2. 引入 semaintic ui，先簡單製作 SearchBar
    
    在 index.html 中 import [semantic ui 的 css CDN](https://cdnjs.com/libraries/semantic-ui) 
    
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css">
    ```
    
    簡單先設計一下 SearchBar
    
    ```jsx
    class SearchBar extends React.Component {
      render() {
        return (
          <div className="search-bar ui segment">
            <form className="ui form">
              <div className="field">
                <label>Video Search</label>
                <input type="text" placeholder="type to search"/>
              </div>
            </form>
          </div>
        )
      }
    }
    ```
    
    目前 SearchBar 是佔滿整個瀏覽器畫面，想把他往中心縮一點的話，
    直接在 App component 中加上 semantic ui 的 className 就好
    
    ```jsx
    class App extends React.Component {
      render() {
        return (
          <div className="ui container">
            <SearchBar />
          </div>
        )
      }
    }
    ```
    
3. 將 SearchBar 做成 **[Controlled Component](https://www.notion.so/0908-Udemy-React-2-f9f0a35ed0ed47c5bae8f1cae7476bec)**
    
    要怎麼變成 Controlled Component？
    
    設定一個 value state 給 component，並用一個 fn 監聽 `onchange`，
    讓每一次輸入都用 `setState()` 更新那個 value state，然後把 state 的值指定給這個 element 的 value props 
    
    ```jsx
    class SearchBar extends React.Component {
      state = { value: '' };
    
      onInputChange = (e) => {
        this.setState({ value: e.target.value });
      }
    
      render() {
        return (
          <div className="search-bar ui segment">
            <form className="ui form">
              <div className="field">
                <label>Video Search</label>
                <input 
                  type="text" 
                  placeholder="type to search"
                  value={ this.state.value }
                  onChange={ this.onInputChange }
                />
              </div>
            </form>
          </div>
        )
      }
    }
    ```
    
4. 製作 submit 功能
    
    ⚠️ 記得要先把 HTML 的 form 元素 default 設定取消掉，不想要他自動 refresh 頁面
    
    ```jsx
    onFormSubmit = e => {
      e.preventDefault();
      this.props.searchSubmit(this.state.value);
    }
    ```
    
5. 將 [SearchBar 的 input value 傳給父層](https://www.notion.so/0908-Udemy-React-2-f9f0a35ed0ed47c5bae8f1cae7476bec)（為了讓父層告知 Youtube 要出現哪些影片）
    
    把「input 值改變的話，同步更新父層 App state 的值」這個 fn 當成 props value 傳給 SearchBar，放在 onSubmit 的 fn 中，並把 form value 做為參數傳進這個 callback fn，
    只要子層 SearchBar 的 `onSubmit` 被觸發，就讀取這個 props value，等於 callback 父層的 `onSearchSubmit` fn，去更新 App 的 state
    
6. 向 YouTube 發送 API request
    1. 先申請 API key
        
        [Google Cloud Platform](https://console.cloud.google.com/projectselector2/apis/dashboard)
        
        若將來有需要，google 可以新增 API key 的一些限制條件
        
        [Google Cloud Platform](https://console.cloud.google.com/apis/credentials/key/296b9839-9411-4689-91da-b9b1d4153699?project=react-youtube-app-328010)
        
    2. YouTube API 文件
        
        [Search: list | YouTube Data API | Google Developers](https://developers.google.com/youtube/v3/docs/search/list)
        
        一樣使用 axios 套件，另外開一個 API 的 component
        
        ```
        npm install --save axios
        ```
        
        ```jsx
        import axios from 'axios';
        
        const KEY = 'AIzaSyCsrGZtR2eJrGQ5CEPwgicIfyIhkt2Ctck';
        
        export default axios.create({
          baseURL: 'https://youtube.googleapis.com/youtube/v3',
          params: {
            part: 'snippet',
            maxResults: 10,
        		type: 'video',
            key: KEY
          }
        })
        ```
        
7. 把 5 & 6 步驟連接起來：讓 SearchBar 的 input value 正確傳給 youtube API request，
並回傳相對應的 response
    
    ```jsx
    // App Component
    class App extends React.Component {
      state = { videos: [] };
    
      onSearchSubmit = async value => {
        const response = await youtube.get('/search', { 
          params: { q: value }
        });
    
        this.setState({ videos: response.data.items });
      }
    
      render() {
        return (
          <div className="ui container">
            <SearchBar searchSubmit={ this.onSearchSubmit } />
          </div>
        )
      }
    }
    ```
    
    ```jsx
    // SearchBar Component
    class SearchBar extends React.Component {
      state = { value: '' };
    
      onInputChange = e => {
        this.setState({ value: e.target.value });
      }
    
      onFormSubmit = e => {
        e.preventDefault();
        this.props.searchSubmit(this.state.value);
      }
    
      render() {
        return (
          <div className="search-bar ui segment">
            <form onSubmit={ this.onFormSubmit } className="ui form">
              <div className="field">
                <label>Video Search</label>
                <input 
                  type="text" 
                  placeholder="type to search"
                  value={ this.state.value }
                  onChange={ this.onInputChange }
                />
              </div>
            </form>
          </div>
        )
      }
    }
    ```
    
8. 讓 fetch 到的 response 呈現在 VideoList 的 component 上
    1. 製作 VideoItem Component，
    把從父層收到的 props value（影片陣列） render 在 item 上面
        
        先簡單讓 VideoItem 直接 return 假字串，在 VideoList 中把得到的 response array，
        用 map 方式，把每一個 array 中的 item 以 VideoItem component 形式 render 在畫面上
        
        ```jsx
        // VideoItem Component
        const VideoItem = () => {
          return (
            <div>Video Item</div>
          )
        }
        ```
        
        ```jsx
        // VideoList Component
        import VideoItem from './VideoItem';
        
        const VideoList = ({ videos }) => {
          const videoArray = videos.map((video) => {
            return <VideoItem />;
          })
          
          return (
            <div>{ videoArray }</div>
          )
        }
        ```
        
    2. 在 VideoList 中，再把從父層 App 收到的 video response 當成 props 傳給 VideoItem，
    VideoItem 就可以讀取到 youtube API 傳來的 response 了
        
        先將需要的資料 render 在畫面上：（title & img）
        
        ```jsx
        // VideoList Component
        const VideoList = ({ videos }) => {
          const videoArray = videos.map((video) => {
            return <VideoItem video={ video } />;
          })
          
          return (
            <div>{ videoArray }</div>
          )
        }
        ```
        
        ```jsx
        // VideoItem Component
        const VideoItem = ({ video }) => {
          return (
            <div>
              <img src={ video.snippet.thumbnails.medium.url } />
              { video.snippet.title }
            </div>
          )
        }
        ```
        
    3. 把 VideoItem 加上 CSS 樣式（用 semantic ui 和 css ）
        
        ```jsx
        const VideoItem = ({ video }) => {
          return (
            <div className="video-item item" >
              <img className="ui image" src={ video.snippet.thumbnails.medium.url } />
              <div className="content">
                <div className="header">{ video.snippet.title }</div>
              </div>
            </div>
          )
        }
        ```
        
        ```css
        .video-item {
          display: flex !important;
          align-items: center !important;
          cursor: pointer; 
        }
        
        .video-item.item img {
          max-width: 180px;
        }
        ```
        
    
9. 點擊 VideoList 中某個 VideoItem 後，將它放大 display 在 VideoDetail Component 中
    1. 在 App component 新增另一個 `state：selectedVideo`
        
        為了當某個 VideoItem 被點擊時，更新此 state 的 value 給 VideoDetail component，
        使他 re-render 在畫面上
        
        ```jsx
        class App extends React.Component {
          state = { 
            videos: [],
            selectedVideo: null
          };
        
        	onSelectVideo = (video) => {
            console.log(video);
          }
        
        	render() {
            return (
              <div className="ui container">
                <SearchBar searchSubmit={ this.onSearchSubmit } />
                <VideoList onSelectVideo={ this.onSelectVideo } videos={ this.state.videos } />
              </div>
            )
          }
        }
        ```
        
    2. 為了讓 App component 知道是哪一個 item 被點擊，需要做一個 callback fn，
    當成 props 傳給下面的子 component
        
        當這個 callback fn 被觸發時，**在參數中回傳是哪一個 item 觸發此 callback**，
        進而讓最上層的 App component 得知，再往下傳給 VideoDetail Component
        
        ```jsx
        // App component 
        // 前略
        
        // 用這個 callback fn 更新 state
        onSelectVideo = (video) => {
          this.setState({ 
            selectedVideo: video
          });
        }
        
        render() {
          return (
            <div className="ui container">
              <SearchBar searchSubmit={ this.onSearchSubmit } />
              <VideoList onSelectVideo={ this.onSelectVideo } videos={ this.state.videos } />
            </div>
          )
        }
        ```
        
        ```jsx
        // VideoList component
        const VideoList = ({ videos, onSelectVideo }) => {
          const videoArray = videos.map((video) => {
            return <VideoItem onSelectVideo={ onSelectVideo } video={ video } />;
          })
          
          return (
            <div className="ui relaxed divided list" >{ videoArray }</div>
          )
        }
        ```
        
        ```jsx
        // VideoItem component
        const VideoItem = ({ video, onSelectVideo }) => {
          return (
            <div onClick={ () => onSelectVideo(video) } className="video-item item" >
              <img 
                className="ui image" 
                src={ video.snippet.thumbnails.medium.url } 
                alt={ video.snippet.title }
              />
              <div className="content">
                <div className="header">{ video.snippet.title }</div>
              </div>
            </div>
          )
        }
        ```
        
    3. 在 VideoDetail component 中讀取從父層 App 收到的 props value
        
        先簡單 display 被點擊的影片的 title
        
        ```jsx
        // VideoDetail component
        const VideoDetail = ({ video }) => {
          if (!video) { 
            return <div>Loading..</div>
          }
        
          return <div>{ video.snippet.title }</div>
        };
        
        export default VideoDetail;
        ```
        
        ```jsx
        // App component 
        // 前略
        
        // 用這個 callback fn 更新 state
        onSelectVideo = (video) => {
          this.setState({ 
            selectedVideo: video
          });
        }
        
        render() {
          return (
            <div className="ui container">
              <SearchBar searchSubmit={ this.onSearchSubmit } />
        			<VideoDetail video={ this.state.selectedVideo }/>
              <VideoList onSelectVideo={ this.onSelectVideo } videos={ this.state.videos } />
            </div>
          )
        }
        ```
        
    4. 稍微調整一下 VideoDetail component 的 style
        
        ```jsx
        const VideoDetail = ({ video }) => {
          if (!video) { 
            return <div>Loading..</div>
          }
        
          return (
            <div>
              <div className="ui segment">
                <h4 className="ui header">{ video.snippet.title }</h4>
                <p>{ video.snippet.description }</p>
              </div>
            </div>
          )
        };
        ```
        
    5. 在 VideoDetail component 中放入播放器！
        
        這邊直接使用 iframe tag
        
        ```jsx
        const VideoDetail = ({ video }) => {
          if (!video) { 
            return <div>Loading..</div>
          }
        
          const videoSrc = `https://www.youtube.com/embed/${video.id.videoId}`;
        
          return (
            <div>
              <div className="ui embed">
                <iframe src={ videoSrc } />
              </div>
              <div className="ui segment">
                <h4 className="ui header">{ video.snippet.title }</h4>
                <p>{ video.snippet.description }</p>
              </div>
            </div>
          )
        };
        ```
        
10. 修改畫面排版，讓 VideoList 在畫面右側，播放器佔大多版面（使用 sementic ui）
    
    ```jsx
    render() {
      return (
        <div className="ui container">
          <SearchBar searchSubmit={ this.onSearchSubmit } />
          <div className="ui grid">
            <div className="ui row">
              <div className="eleven wide column">
                <VideoDetail video={ this.state.selectedVideo }/>
              </div>
              <div className="five wide column">
                <VideoList onSelectVideo={ this.onSelectVideo } videos={ this.state.videos } />
              </div>
            </div>
          </div>
        </div>
      )
    }
    ```
    
11. 優化使用者體驗
    1. 目前播放器呈現的影片，不會隨著搜尋字和 VideoList 變更而被清空
        
        就讓控制 VideoDetail 的 state 跟著 SearchBar onChange 觸發的那個 callback 一起更新，
        預設讓他直接 display 清單中的第一個 item
        
        ```jsx
        onSearchSubmit = async value => {
          const response = await youtube.get('/search', { 
            params: { q: value }
          });
          this.setState({ 
            videos: response.data.items,
            selectedVideo: response.data.items[0]
          });
        }
        ```
        
    2. 最一開始的畫面初始化設定
        
        預設搜尋字，讓一進入頁面可以直接看到影片
        
        component 第一次 render 後的初始化設定：`componentDidMount()`
        複習：[componentDidMount()](https://www.notion.so/0819-Udemy-React-Robofriends-a773ec3c5c4348b2b8403a20a10249ad) 
        
        在 `componentDidMount()` 中呼叫 onSearchSubmit，
        在裡面預設搜尋字
        
        ```jsx
        componentDidMount() {
          this.onSearchSubmit('puppies');
        }
        ```
        
12. [extra] 想把網頁做成 RWD，讓 VideList 小於一定寬度就掉下去
    
    參考 semantic ui 範例做法：
    
    [Responsive Elements](https://semantic-ui.com/examples/responsive.html)
    
    可以使用 google dev tool 檢視他如何運用 semantic ui 來達成 RWD 效果
    
    以這次專案來說，在 grid 那層 div 的 className 再加上 stackable 即可
    

## 學習重點

### 1. HTML iframe tag 介紹

[HTML 內嵌框架 Inline Frame - HTML 語法教學 Tutorial](https://www.fooish.com/html/iframe-tag.html)

文章中有提到還是少用 iframe，看來對網站效能和 SEO 都有不太好的影響
