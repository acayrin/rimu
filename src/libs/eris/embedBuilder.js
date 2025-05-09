function Embed() {
  this.title = null;
  this.description = null;
  this.url = null;
  this.timestamp = null;
  this.color = null;
  this.footer = null;
  this.image = null;
  this.thumbnail = null;
  this.author = null;
  this.fields = [];

  this.setTitle = _t => {
    this.title = _t;
  };

  this.setDescription = _d => {
    this.description = _d;
  };

  this.setURL = _u => {
    this.url = _u;
  };

  this.setTimestamp = _ts => {
    this.timestamp = _ts;
  };

  this.setColor = _c => {
    this.color = _c;
  };

  this.setFooter = (_t, _u) => {
    this.footer = {
      text: _t,
      url: _u
    };
  };

  this.setImage = _u => {
    this.image = {
      url: _u
    };
  };

  this.setThumbnail = _u => {
    this.thumbnail = {
      url: _u
    };
  };

  this.setAuthor = (_n, _u, _i) => {
    this.author = {
      name: _n,
      url: _u,
      icon_url: _i
    };
  };

  this.fields = [];

  this.addField = (_n, _v, _l) => {
    this.fields.push({
      name: _n,
      value: _v,
      inline: _l
    });
  };
}

module.exports = {
  Embed
};