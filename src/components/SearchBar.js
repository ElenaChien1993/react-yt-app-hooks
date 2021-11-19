import React,{ useState } from 'react';

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

export default SearchBar;