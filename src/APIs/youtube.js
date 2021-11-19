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