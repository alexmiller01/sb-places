/**
 * Places Supertop – real location data and search
 * Use from http://localhost:3000 (not file://) so the API works.
 */

(function () {
  function run() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const locationTitle = document.getElementById('location-title');
    const locationSubtitle = document.getElementById('location-subtitle');
    const mapIframe = document.getElementById('map-iframe');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const aboutText = document.getElementById('about-text');
    const factsList = document.getElementById('facts-list');
    const weatherToday = document.getElementById('weather-today');
    const weatherTomorrow = document.getElementById('weather-tomorrow');
    const weatherFriday = document.getElementById('weather-friday');
    const flightsPrice = document.getElementById('flights-price');
    const flightsDetail = document.getElementById('flights-detail');
    const galleryMain = document.getElementById('gallery-main');
    const galleryThumb1 = document.getElementById('gallery-thumb1');
    const galleryThumb2 = document.getElementById('gallery-thumb2');

    const DEFAULT_QUERY = 'Tokyo, Japan';

    function getMapEmbedUrl(lat, lon) {
      return 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lon - 0.1) + '%2C' + (lat - 0.05) + '%2C' + (lon + 0.1) + '%2C' + (lat + 0.05) + '&layer=mapnik&marker=' + lat + '%2C' + lon;
    }

    function updateWeather(forecast) {
      if (!forecast || !forecast.length) return;
      var labels = [weatherToday, weatherTomorrow, weatherFriday];
      forecast.slice(0, 3).forEach(function (day, i) {
        if (labels[i]) {
          var hi = day.high != null ? day.high : '–';
          var lo = day.low != null ? day.low : '–';
          labels[i].textContent = hi + '° ' + lo + '°';
        }
      });
    }

    function setText(el, text) {
      if (el) el.textContent = text;
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function updatePage(data) {
      var name = data.displayName || 'Location';
      var lat = data.lat;
      var lon = data.lon;

      setText(locationTitle, name);
      if (data.subtitle != null && data.subtitle !== '') {
        setText(locationSubtitle, data.subtitle);
      }

      var overviewTitle = document.getElementById('overview-title');
      if (overviewTitle) overviewTitle.textContent = 'More about ' + name;

      if (lat != null && lon != null && mapIframe && mapPlaceholder) {
        mapIframe.src = getMapEmbedUrl(lat, lon);
        mapIframe.style.display = 'block';
        mapPlaceholder.style.display = 'none';
      } else if (mapPlaceholder) {
        mapPlaceholder.style.display = 'flex';
        mapPlaceholder.textContent = 'Map loads with location';
      }

      if (data.weather && data.weather.forecast) {
        updateWeather(data.weather.forecast);
      }

      if (data.flights) {
        setText(flightsPrice, data.flights.price || '$884');
        if (flightsDetail) {
          var parts = [data.flights.duration];
          if (data.flights.from) parts.push('from ' + data.flights.from);
          flightsDetail.textContent = parts.join(' ');
        }
      }

      if (data.images && data.images.length >= 3) {
        if (galleryMain) galleryMain.src = data.images[0];
        if (galleryThumb1) galleryThumb1.src = data.images[1];
        if (galleryThumb2) galleryThumb2.src = data.images[2];
      }

      if (data.about && aboutText) aboutText.innerHTML = data.about + ' <a href="#">More</a>';
      if (data.facts && Array.isArray(data.facts) && factsList) {
        factsList.innerHTML = data.facts.map(function (f) {
          return '<li><span class="places-facts-label">' + escapeHtml(f.label) + '</span> <span class="places-facts-value">' + escapeHtml(f.value) + '</span></li>';
        }).join('');
      }

      var resultsHeading = document.getElementById('places-results-heading');
      var resultsList = document.getElementById('places-results-list');
      if (data.searchResults && Array.isArray(data.searchResults) && resultsList) {
        if (resultsHeading) {
          var placePart = (name.split(',')[0] || name).trim();
          resultsHeading.textContent = placePart ? 'Best things to do in ' + placePart : 'Search results';
        }
        resultsList.innerHTML = data.searchResults.map(function (r) {
          var link = (r.link || '#').replace(/"/g, '&quot;');
          return '<div class="places-result-card">' +
            (r.image ? '<div class="places-result-thumb"><img src="' + r.image + '" alt="" /></div>' : '') +
            '<div class="places-result-body">' +
            (r.source ? '<span class="places-result-source">' + escapeHtml(r.source) + '</span>' : '') +
            '<h3 class="title"><a href="' + link + '">' + escapeHtml(r.title || '') + '</a></h3>' +
            (r.snippet ? '<p class="places-result-snippet">' + escapeHtml(r.snippet) + '</p>' : '') +
            '</div></div>';
        }).join('');
      }
    }

    function loadLocation(q) {
      if (!q) return;

      setText(locationTitle, q);
      if (mapPlaceholder) {
        mapPlaceholder.style.display = 'flex';
        mapPlaceholder.textContent = 'Loading…';
      }
      if (mapIframe) {
        mapIframe.style.display = 'none';
        mapIframe.removeAttribute('src');
      }

      var url = '/api/places/location?q=' + encodeURIComponent(q);
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error(r.statusText);
          return r.json();
        })
        .then(function (data) {
          updatePage(data);
          if (typeof history !== 'undefined' && history.replaceState) {
            history.replaceState({ q: q }, '', '?q=' + encodeURIComponent(q));
          }
        })
        .catch(function (err) {
          console.error('Load location error:', err);
          setText(locationTitle, q);
          setText(locationSubtitle, 'Could not load details. Make sure you open this page from http://localhost:3000 (run: npm start) and try again.');
          if (mapPlaceholder) {
            mapPlaceholder.style.display = 'flex';
            mapPlaceholder.textContent = 'Map unavailable';
          }
        });
    }

    function doSearch() {
      if (searchInput) loadLocation(searchInput.value.trim());
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSearch();
        }
      });
    }

    /* Overview expand/collapse */
    var overviewBlock = document.getElementById('overview-block');
    if (overviewBlock) {
      function expandOverview() {
        overviewBlock.classList.add('is-expanded');
        overviewBlock.setAttribute('aria-expanded', 'true');
      }
      function collapseOverview() {
        overviewBlock.classList.remove('is-expanded');
        overviewBlock.setAttribute('aria-expanded', 'false');
      }
      overviewBlock.addEventListener('click', function () {
        if (overviewBlock.classList.contains('is-expanded')) collapseOverview();
        else expandOverview();
      });
      overviewBlock.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!overviewBlock.classList.contains('is-expanded')) expandOverview();
        }
      });
    }

    /* Map expand/collapse with center animation */
    var mapExpandBtn = document.querySelector('.supertop-map-expand');
    var mapWrap = document.querySelector('.supertop-map');
    var mapInner = mapWrap ? mapWrap.querySelector('.supertop-map-inner') : null;
    var bricks = document.querySelector('.supertop-bricks');
    var mapExpandLabel = mapExpandBtn ? mapExpandBtn.querySelector('.supertop-map-expand-label') : null;
    var mapTransitioning = false;
    var resizeRaf = null;

    function continuousResize() {
      window.dispatchEvent(new Event('resize'));
      if (mapTransitioning) {
        resizeRaf = requestAnimationFrame(continuousResize);
      }
    }

    var mapClickTimer = null;
    var mapMouseMoved = false;
    if (mapWrap && !mapWrap.classList.contains('is-expanded')) {
      mapWrap.addEventListener('mousedown', function () {
        mapMouseMoved = false;
      });
      mapWrap.addEventListener('mousemove', function () {
        mapMouseMoved = true;
      });
      mapWrap.addEventListener('click', function (e) {
        if (mapWrap.classList.contains('is-expanded')) return;
        if (mapMouseMoved) return;
        if (e.target.closest('.supertop-map-expand')) return;
        if (e.target.closest('.supertop-map-ctrl')) return;
        if (window.innerWidth < 768 && typeof openMobileMapOverlay === 'function') {
          openMobileMapOverlay();
          return;
        }
        if (mapExpandBtn) mapExpandBtn.click();
      });
    }

    if (mapExpandBtn && mapWrap && bricks) {
      mapExpandBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.innerWidth < 768 && typeof openMobileMapOverlay === 'function') {
          openMobileMapOverlay();
          return;
        }
        if (mapTransitioning) return;
        mapTransitioning = true;
        resizeRaf = requestAnimationFrame(continuousResize);

        var isExpanded = mapWrap.classList.contains('is-expanded');
        if (isExpanded) {
          if (typeof closeBusinessOverlay === 'function') closeBusinessOverlay();
          mapWrap.classList.add('is-collapsing');
          mapWrap.classList.remove('is-expanded');
          bricks.classList.remove('is-map-expanded');
          mapExpandBtn.setAttribute('aria-expanded', 'false');
          mapExpandBtn.setAttribute('aria-label', 'Expand map');
          if (mapExpandLabel) mapExpandLabel.textContent = 'Explore';

          var onCollapseDone = function (ev) {
            if (ev.propertyName !== 'height') return;
            mapWrap.removeEventListener('transitionend', onCollapseDone);
            mapWrap.classList.remove('is-collapsing');
            mapTransitioning = false;
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new CustomEvent('supertop-map-expanded', { detail: { expanded: false } }));
          };
          mapWrap.addEventListener('transitionend', onCollapseDone);
        } else {
          mapWrap.classList.add('is-expanded');
          bricks.classList.add('is-map-expanded');
          mapExpandBtn.setAttribute('aria-expanded', 'true');
          mapExpandBtn.setAttribute('aria-label', 'Collapse map');
          if (mapExpandLabel) mapExpandLabel.textContent = 'Collapse';

          var onExpandDone = function (ev) {
            if (ev.propertyName !== 'height') return;
            mapWrap.removeEventListener('transitionend', onExpandDone);
            mapTransitioning = false;
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new CustomEvent('supertop-map-expanded', { detail: { expanded: true } }));
          };
          mapWrap.addEventListener('transitionend', onExpandDone);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
