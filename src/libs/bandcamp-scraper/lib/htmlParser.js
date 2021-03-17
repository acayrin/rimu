const cheerio = require('cheerio');

const scrapeIt = require('scrape-it');

const urlHelper = require('url');

const linez = require('linez');

const Ajv = require('ajv');

const JSON5 = require('json5');

const ajv = new Ajv();
ajv.addSchema(require('../schemas/search-result.json'), 'search-result');
ajv.addSchema(require('../schemas/album-product.json'), 'album-product');
ajv.addSchema(require('../schemas/album-info.json'), 'album-info');
ajv.addSchema(require('../schemas/tag-result.json'), 'tag-result');
linez.configure({
  newlines: ['\n', '\r\n', '\r']
});

const removeMultipleSpace = function (text) {
  return text.replace(/\s{2,}/g, ' ');
};

const removeNewLine = function (text) {
  text = linez(text).lines.map(function (line) {
    return line.text.trim();
  }).join(' ');
  return removeMultipleSpace(text);
};

const assignProps = function (objFrom, objTo, propNames) {
  propNames.forEach(function (propName) {
    objTo[propName] = objFrom[propName];
  });
  return objTo;
};

exports.parseSearchResults = function (html) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    results: {
      listItem: '.result-items li',
      data: {
        type: {
          selector: '.itemtype',
          convert: function (text) {
            return text.toLowerCase();
          }
        },
        name: {
          selector: '.heading'
        },
        url: {
          selector: '.itemurl'
        },
        imageUrl: {
          selector: '.art img',
          attr: 'src'
        },
        tags: {
          selector: '.tags',
          convert: function (text) {
            const tags = text.replace('tags:', '').replace(/\s/g, '');
            return tags.length > 1 ? tags.split(',') : [];
          }
        },
        genre: {
          selector: '.genre',
          convert: function (text) {
            return removeMultipleSpace(text.replace('genre:', ''));
          }
        },
        subhead: {
          selector: '.subhead',
          convert: function (text) {
            return removeMultipleSpace(text);
          }
        },
        releaseDate: {
          selector: '.released',
          convert: function (text) {
            return text.replace('released ', '');
          }
        },
        numTracks: {
          selector: '.length',
          convert: function (text) {
            const info = text.split(',');

            if (info.length === 2) {
              return parseInt(info[0].replace(' tracks', ''));
            }
          }
        },
        numMinutes: {
          selector: '.length',
          convert: function (text) {
            const info = text.split(',');

            if (info.length === 2) {
              return parseInt(info[1].replace(' minutes', ''));
            }
          }
        }
      }
    }
  });
  return data.results.reduce(function (results, result) {
    let object = assignProps(result, {}, ['type', 'name', 'url', 'imageUrl', 'tags']);

    switch (result.type) {
      case 'artist':
        object.genre = result.genre;
        object.location = removeMultipleSpace(result.subhead).trim();
        break;

      case 'album':
        object = assignProps(result, object, ['releaseDate', 'numTracks', 'numMinutes']);
        object.artist = result.subhead.replace('by ', '').trim();
        break;

      case 'track':
        object.releaseDate = result.releaseDate;

        if (result.subhead) {
          const info = result.subhead.trim().split(' by ');

          if (info.length > 0) {
            object.album = removeNewLine(info[0]).replace('location', '').replace(/^from /, '');
            info.shift();
            object.artist = removeNewLine(info.join(' by '));
          }
        }

        break;

      case 'fan':
        object.genre = result.genre;
        break;
    }

    if (ajv.validate('search-result', object)) {
      results.push(object);
    } else {
      console.error('Validation error on search result: ', ajv.errorsText(), object, ajv.errors);
    }

    return results;
  }, []);
};

exports.parseTagResults = function (html) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    results: {
      listItem: '.item_list .item',
      data: {
        name: {
          selector: '.itemtext'
        },
        artist: {
          selector: '.itemsubtext'
        },
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  });
  return data.results.reduce(function (results, result) {
    const object = assignProps(result, {}, ['name', 'artist', 'url']);

    if (ajv.validate('tag-result', object)) {
      results.push(object);
    } else {
      console.error('Validation error on tag result: ', ajv.errorsText(), object, ajv.errors);
    }

    return results;
  }, []);
};

exports.parseAlbumUrls = function (html, artistUrl) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    albumLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert: function (href) {
            if (/^\/(track|album)\/(.+)$/.exec(href)) {
              return new urlHelper.URL(href, artistUrl).toString();
            }
          }
        }
      }
    }
  });
  return data.albumLinks.reduce(function (albumUrls, albumLink) {
    const url = albumLink.url;

    if (url) {
      if (albumUrls.indexOf(url) === -1) {
        albumUrls.push(url);
      }
    }

    return albumUrls;
  }, []);
};

exports.parseArtistUrls = function (html, labelUrl) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    artistLinks: {
      listItem: 'a',
      data: {
        url: {
          attr: 'href',
          convert: function (href) {
            if (/tab=artists*$/.exec(href)) {
              return new urlHelper.URL(href, labelUrl).toString();
            }
          }
        }
      }
    }
  });
  return data.artistLinks.reduce(function (artistUrls, artistLink) {
    const url = artistLink.url;

    if (url) {
      if (artistUrls.indexOf(url) === -1) {
        artistUrls.push(url);
      }
    }

    return artistUrls;
  }, []);
};

exports.extractJavascriptObjectVariable = function (html, variableName) {
  const regex = new RegExp('var ' + variableName + '\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;');
  const matches = html.match(regex);

  if (matches && matches.length === 2) {
    return matches[1];
  }
};

exports.parseAlbumInfo = function (html, albumUrl) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    album: {
      selector: 'body',
      data: {
        artist: {
          selector: '#name-section span'
        },
        title: {
          selector: '#name-section .trackTitle'
        },
        imageUrl: {
          selector: '#tralbumArt img',
          attr: 'src',
          convert: function (src) {
            if (src) {
              return src.replace(/_\d{1,3}\./, '_2.');
            }
          }
        },
        tags: {
          listItem: '.tag',
          data: {
            name: {
              convert: function (tag) {
                return tag;
              }
            }
          }
        },
        tracks: {
          listItem: 'table#track_table tr.track_row_view',
          data: {
            name: {
              selector: 'span.track-title'
            },
            url: {
              selector: '.info_link a',
              attr: 'href',
              convert: function (href) {
                if (!href) return null;
                return new urlHelper.URL(href, albumUrl).toString();
              }
            },
            duration: {
              selector: '.time',
              convert: function (duration) {
                if (!duration) return null;
                return duration;
              }
            }
          }
        },
        nonPlayableTracks: {
          listItem: 'table#track_table tr.track_row_view',
          data: {
            name: {
              selector: '.title>span:not(.time)'
            }
          }
        }
      }
    }
  });

  for (const nonPlayableTrack of data.album.nonPlayableTracks) {
    data.album.tracks.push(nonPlayableTrack);
  }

  ;
  const object = assignProps(data.album, {}, ['tags', 'artist', 'title', 'imageUrl', 'tracks']);
  object.tracks = object.tracks.filter(x => x.name !== '');

  for (let i = 0; i < object.tracks.length; i++) {
    for (const key in object.tracks[i]) {
      if (Object.prototype.hasOwnProperty.call(object.tracks[i], key)) {
        if (!object.tracks[i][key]) {
          delete object.tracks[i][key];
        }
      }
    }
  }

  const scriptWithRaw = $('script[data-tralbum]');

  if (scriptWithRaw.length > 0) {
    object.raw = scriptWithRaw.data('tralbum');
  } else {
    let raw = this.extractJavascriptObjectVariable(html, 'TralbumData');
    raw = raw ? raw.replace('" + "', '') : '';

    try {
      object.raw = JSON5.parse(raw);
    } catch (error) {
      console.error(error);
    }
  }

  object.url = albumUrl;

  if (ajv.validate('album-info', object)) {
    return object;
  } else {
    console.error('Validation error on album info: ', ajv.errorsText(), object);
    return null;
  }
};

exports.parseArtistInfo = function (html, artistUrl) {
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    name: '#band-name-location .title',
    location: '#band-name-location .location',
    coverImage: {
      selector: '.bio-pic a',
      attr: 'href'
    },
    description: 'p#bio-text',
    albums: {
      listItem: '.music-grid-item',
      data: {
        url: {
          selector: 'a',
          attr: 'href',
          convert: href => artistUrl + href
        },
        coverImageSrc: {
          selector: 'img',
          attr: 'src'
        },
        coverImageOriginal: {
          selector: 'img',
          attr: 'data-original'
        },
        title: '.title'
      }
    },
    discographyAlbums: {
      listItem: '#discography ul li',
      data: {
        url: {
          selector: 'a',
          attr: 'href',
          convert: href => artistUrl + href
        },
        coverImage: {
          selector: 'img',
          attr: 'src'
        },
        title: '.trackTitle a'
      }
    },
    shows: {
      listItem: '#showography ul li',
      data: {
        date: '.showDate',
        venue: '.showVenue a',
        venueUrl: {
          selector: '.showVenue a',
          attr: 'href'
        },
        location: '.showLoc'
      }
    },
    bandLinks: {
      listItem: '#band-links li',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  });

  const mapAlbums = album => ({
    url: album.url,
    title: album.title,
    coverImage: album.coverImageOriginal || album.coverImageSrc
  });

  const albums = data.albums.map(mapAlbums);
  const mergedAlbums = [...new Set([...albums, ...data.discographyAlbums])];
  return {
    name: data.name,
    location: data.location,
    description: data.description,
    coverImage: data.coverImage,
    albums: mergedAlbums,
    shows: data.shows,
    bandLinks: data.bandLinks
  };
};

exports.parseAlbumProducts = function (html, albumUrl) {
  const albumInfo = this.parseAlbumInfo(html, albumUrl);
  const $ = cheerio.load(html);
  const data = scrapeIt.scrapeHTML($, {
    products: {
      listItem: '.buyItem',
      data: {
        imageUrls: {
          listItem: '.popupImageGallery img',
          data: {
            url: {
              attr: 'src'
            }
          }
        },
        name: {
          selector: '.buyItemPackageTitle',
          convert: removeNewLine
        },
        nameFallback: {
          selector: '.hd.lowHeadroom',
          convert: removeNewLine
        },
        format: {
          selector: '.buyItemPackageTitle'
        },
        formatFallback: {
          selector: '.merchtype'
        },
        priceInCents: {
          selector: '.ft span.base-text-color',
          convert: function (text) {
            const matches = text.match(/(\d+)([.,]?)(\d{0,2})/);

            if (matches) {
              return parseInt(matches[1] + (matches[3] || '00'));
            } else {
              return null;
            }
          }
        },
        currency: {
          selector: '.ft span.secondaryText',
          eq: 0
        },
        offerMore: {
          selector: '.ft span.secondaryText',
          eq: 1,
          convert: function (text) {
            return text.toLowerCase() === 'or more';
          }
        },
        soldOut: {
          selector: '.notable',
          convert: function (text) {
            return text.toLowerCase() === 'sold out';
          }
        },
        nameYourPrice: {
          selector: '.ft span.secondaryText',
          convert: function (text) {
            return text.toLowerCase() === 'name your price';
          }
        },
        description: {
          selector: '.bd',
          convert: function (text) {
            return removeNewLine(text.trim());
          }
        }
      }
    }
  });
  return data.products.reduce(function (products, product) {
    const object = assignProps(product, {}, ['description', 'soldOut', 'nameYourPrice', 'offerMore', 'nameYourPrice']);
    object.url = albumUrl;
    object.format = product.format || product.formatFallback || 'Other';

    if (object.format.match(/digital\s(track|album)/i)) {
      object.name = albumInfo.title;
    } else {
      object.name = product.name || product.nameFallback;
    }

    if (product.imageUrls.length === 0) {
      object.imageUrls = [albumInfo.imageUrl];
    } else {
      object.imageUrls = product.imageUrls.map(function (imageUrl) {
        return imageUrl.url;
      });
    }

    if (product.soldOut) {
      object.priceInCents = null;
      object.currency = null;
    } else if (product.nameYourPrice) {
      object.priceInCents = 0;
      object.currency = null;
    } else {
      object.priceInCents = product.priceInCents;
      object.currency = product.currency;
    }

    object.artist = albumInfo.artist;

    if (ajv.validate('album-product', object)) {
      products.push(object);
    } else {
      console.error('Error: ', ajv.errorsText(), object, JSON.stringify(ajv.errors));
    }

    return products;
  }, []);
};