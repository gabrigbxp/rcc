import { Grid, TextField, Typography } from '@material-ui/core/index'
import { Autocomplete, Rating } from '@material-ui/lab';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css'

let source;

function App() {
  const [films, setFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState();
  const [rating, setRating] = useState(0);
  const [search, setSearch] = useState('');
  const maxPages = 10;

  const isOnRating = item => item.vote_average >= rating * 2 - 2 && item.vote_average <= rating * 2;

  const searchHandler = async e => {
    const value = typeof e === "string" ? e : (e ? e.target.value : search);
    e && setSearch(value);
    source && source.cancel('aborted by new search');
    source = axios.CancelToken.source();

    const endpoint = value ? process.env.REACT_APP_API_ENDPOINT_SEARCH : process.env.REACT_APP_API_ENDPOINT_DISCOVER;
    const query = value ? `&query=${value}` : '';
    const url = `${process.env.REACT_APP_API_BASE_URL}${endpoint}?api_key=${process.env.REACT_APP_API_KEY + query}`;

    setFilms([]);
    fetch(url, 1);
  }

  const fetch = (url, page) => {
    axios.get(url + `&page=${page}`, {
      cancelToken: source.token
    }).then(response => {
      addFilms(response.data.results.reduce((acc, item) => {
        if (rating && !isOnRating(item)) return acc;
        acc.push(item);
        return acc;
      }, []));

      page < response.data.total_pages && page < maxPages && fetch(url, page + 1);
    }).catch(e => {
      if (e.message !== 'aborted by new search') {
      }
    });
  }

  const addFilms = aux => {
    setFilms([...films, ...aux]);
  }

  useEffect(() => {
    selectedFilm !== undefined && searchHandler(selectedFilm !== null ? selectedFilm.title : "");
  }, [selectedFilm]);

  const rateHandler = (e, v) => {
    setRating(v !== rating ? v : 0);
  }

  return (
    <>
      <Grid container style={{ marginTop: 10 }}>
        <Grid item md={6}>
          <Autocomplete
            className='selector'
            options={films}
            getOptionLabel={option => option.original_title}
            style={{ width: '300px', padding: 10 }}
            onChange={(e, v) => setSelectedFilm(v)}
            getOptionSelected={() => true}
            renderInput={
              params => <TextField
                {...params}
                onKeyUp={searchHandler}
                onFocus={searchHandler}
                label="Search a film"
                variant="outlined" />}
          />
        </Grid>
        <Grid item md={6}>
          <Typography component="legend">Rating</Typography>
          <Rating
            name='rating'
            value={rating}
            onChange={rateHandler}
          />
        </Grid>
      </Grid>
      {selectedFilm && <Grid container className='details'>
        <Grid item md={12}>
          <h1>{selectedFilm.original_title} ({selectedFilm.vote_average})</h1>
        </Grid>
        <Grid item container>
          <Grid item md={6}>
            <img src={`https://image.tmdb.org/t/p/w500${selectedFilm.poster_path}`} alt={selectedFilm.original_title} id='poster' />
          </Grid>
          <Grid item md={6}>
            {selectedFilm.overview}
          </Grid>
        </Grid>
      </Grid>}
    </>
  );
}

export default App;
