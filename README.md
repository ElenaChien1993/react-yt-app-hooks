[Udemy React](https://www.udemy.com/course/react-redux/learn/lecture/20788014#questions/11581544)

# 06 - youtube app (using Hooks rewrite)

- 本章節重點：練習用學到的 Hooks 改寫 youtube app 專案

## 執行步驟

在 youtube app 專案中，只有 App & SearchBar component 有用到 state 和生命週期，
所以其實只需要改寫這兩個 component 即可

1. 先修改 SearchBar component
    
    把 class component 改成 functional component，再把宣告 state 的方式改成 `useState()`，
    然後逐行檢查改寫 code 即可～
    
    ```jsx
    const SearchBar = ({ onSearchSubmit }) => {
      const [ value, setValue ] = useState('');
    
      const onInputChange = e => {
        setValue(e.target.value);
      }
    
      const onSubmit = e => {
        e.preventDefault();
        onSearchSubmit(value);
      }  
    
      return (
        <div className="search-bar ui segment center">
          <form onSubmit={ onSubmit } className="ui form">
            <div className="field">
              <label>Video Search</label>
              <input 
                type="text" 
                placeholder="type to search"
                value={ value }
                onChange={ onInputChange }
              />
            </div>
          </form>
        </div>
      )
    };
    ```
    
2. 改寫 App component
    
    仿照上面的方式，逐行檢查 code 改寫
    
    ```jsx
    const App = () => {
      const [videos, setVideos] = useState([]);
      const [selectedVideo, setSelectedVideo] = useState(null);
    
      useEffect(() => {
        onSearchSubmit('puppies');
      },[]);
    
      const onSearchSubmit = async value => {
        const response = await youtube.get('/search', { 
          params: { q: value }
        });
    
        setVideos(response.data.items);
        setSelectedVideo(response.data.items[0]);
      }
    
      const onSelectVideo = (video) => {
        setSelectedVideo(video);
      }
    
      return (
        <div className="ui container">
          <SearchBar onSearchSubmit={ onSearchSubmit } />
          <div className="ui stackable grid">
            <div className="ui row">
              <div className="eleven wide column">
                <VideoDetail video={ selectedVideo }/>
              </div>
              <div className="five wide column">
                <VideoList onSelectVideo={ onSelectVideo } videos={ videos } />
              </div>
            </div>
          </div>
        </div>
      )
    };
    ```
    
3. 可以把 App component 寫得乾淨一點（小改善）
    1. 當看到 function 裡面只有一行 code > 可以直接寫進 JSX inline
        
        ```jsx
        return (
          <div className="ui container">
            <SearchBar onSearchSubmit={ onSearchSubmit } />
            <div className="ui stackable grid">
              <div className="ui row">
                <div className="eleven wide column">
                  <VideoDetail video={ selectedVideo }/>
                </div>
                <div className="five wide column">
                  <VideoList 
                    onSelectVideo={(video) => {setSelectedVideo(video)}} 
                    videos={ videos } 
                  />
                </div>
              </div>
            </div>
          </div>
        )
        ```
        
    2. 而當看到只是把 argument 放進另一個 fn 中當 argument，可以再簡化成
        
        ```jsx
        <VideoList 
        	onSelectVideo={setSelectedVideo} 
        	videos={ videos } 
        />
        ```
        
4. （大改善）使用 Custom Hook！
    
    詳細介紹下拉看學習重點 (1)
    
    在 src 資料夾中另開一個新資料夾放 custom hooks，在裡面新增 useVideos.js 檔案
    
    把跟 fetch videos 相關的程式碼都剪下放進這個 hook 中，
    input 是 `defaultSearchTerm`，最後 return output 是 `videos` 和可以改變 videos 的 fn `search`
    
    ```jsx
    import { useState, useEffect } from 'react';
    import youtube from '../APIs/youtube';
    
    const useVideo = (defaultSearchTerm) => {
      const [videos, setVideos] = useState([]);
    
      useEffect(() => {
        search(defaultSearchTerm);
      },[]);
    
      const search = async value => {
        const response = await youtube.get('/search', { 
          params: { q: value }
        });
      
        setVideos(response.data.items);
      }
    
      return [videos, search]
    };
    
    export default useVideo;
    ```
    
5. 在 App component 中使用 `useVideos` hook
    
    原本 `setSelectedVideo` 呼叫的時間點是在拿到新的 videos list 之後，
    所以可以使用 `useEffect()` 讓它在當 `videos` 有資料變更時去執行這件事
    
    ```jsx
    const App = () => {
      const [selectedVideo, setSelectedVideo] = useState(null);
      const [videos, search] = useVideos('puppies');
    
      useEffect(() => {
        setSelectedVideo(videos[0]);
      }, [videos]);
    
      return (
        <div className="ui container">
          <SearchBar onSearchSubmit={search} />
          <div className="ui stackable grid">
            <div className="ui row">
              <div className="eleven wide column">
                <VideoDetail video={ selectedVideo }/>
              </div>
              <div className="five wide column">
                <VideoList 
                  onSelectVideo={ setSelectedVideo } 
                  videos={ videos } 
                />
              </div>
            </div>
          </div>
        </div>
      )
    };
    ```
    

# 學習重點

## 1. Custom Hook

[打造你自己的 Hook - React](https://zh-hant.reactjs.org/docs/hooks-custom.html)

當我們想要在不同的 component 中使用相同邏輯的 function，就可以把這個 function 做成 Custom Hook 來重複使用！

一個自定義的 Hook 是以「`use`」為開頭命名的 JavaScript function，
而且它可能也呼叫其他的 Hook

💡 當你想要重複利用某些 JSX >> 做成 component

💡 當你想要重複利用某些 function 邏輯 >> 做成 custom hook

通常 custom hook 有以下特點：

- 至少會包含使用一個原始的 Hook（useState / useEffect 等）
- 讓每一個 custom hook 保持只有一個目的就好
- Data-fetching 是一個可以做成 custom hook 很好的範例
- 在 src 資料夾內另開一個資料夾放 hooks

最重要的是你的 hook 最後要可以完成一句話：假設我給 hook ___，hook 要 return 我 ____。

最後 return 的地方可以採用 useState 慣用的陣列形式 `[]`；也可以採用 JS 慣用的物件形式 `{}`
