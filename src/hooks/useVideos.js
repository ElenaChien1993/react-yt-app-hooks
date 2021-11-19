import { useState, useEffect } from 'react';
import youtube from '../APIs/youtube';

const useVideo = (defaultSearchTerm) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    search(defaultSearchTerm);
  },[defaultSearchTerm]);

  const search = async value => {
    const response = await youtube.get('/search', { 
      params: { q: value }
    });
  
    setVideos(response.data.items);
  }

  return [videos, search]
};

export default useVideo;