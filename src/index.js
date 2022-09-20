import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

export default async function fetchImages(value, page) {
  const url = 'https://pixabay.com/api/';
  const key = '29775491-8c8dbad52c72facef0fd3f89b';
  const filter = `?key=${key}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

  return await axios.get(`${url}${filter}`).then(response => response.data);
}

const { searchForm, gallery, loadMoreBtn, endCollectionText } = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    endCollectionText: document.querySelector('.end-collection-text'),
  };
  
  function renderCardImage(arr) {
    const markup = arr.map(item => cardTemplate(item)).join('');
    gallery.insertAdjacentHTML('beforeend', markup);
  }
  
  let lightbox = new SimpleLightbox('.photo-card a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
  
  let currentPage = 1;
  let currentHits = 0;
  let searchQuery = '';
  
  searchForm.addEventListener('submit', onSubmitSearchForm);
  
  async function onSubmitSearchForm(e) {
    e.preventDefault();
    searchQuery = e.currentTarget.searchQuery.value;
    currentPage = 1;
  
    if (searchQuery === '') {
      return;
    }
  
    const response = await fetchImages(searchQuery, currentPage);
    currentHits = response.hits.length;
  
    if (response.totalHits > 40) {
      loadMoreBtn.classList.remove('is-hidden');
    } else {
      loadMoreBtn.classList.add('is-hidden');
    }
  
    try {
      if (response.totalHits > 0) {
        Notify.success(`Hooray! We found ${response.totalHits} images.`);
        gallery.innerHTML = '';
        renderCardImage(response.hits);
        lightbox.refresh();
        endCollectionText.classList.add('is-hidden');
  
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
  
        window.scrollBy({
          top: cardHeight * -100,
          behavior: 'smooth',
        });
      }
  
      if (response.totalHits === 0) {
        gallery.innerHTML = '';
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        loadMoreBtn.classList.add('is-hidden');
        endCollectionText.classList.add('is-hidden');
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);
  
  async function onClickLoadMoreBtn() {
    currentPage += 1;
    const response = await fetchImages(searchQuery, currentPage);
    renderCardImage(response.hits);
    lightbox.refresh();
    currentHits += response.hits.length;
  
    if (currentHits === response.totalHits) {
      loadMoreBtn.classList.add('is-hidden');
      endCollectionText.classList.remove('is-hidden');
    }
  }

