var expect = require('chai').expect,
    Config = require('../lib/config.js');

describe('Config', function () {
  describe('#get, ', function () {
    describe('if config right\, ', function () {
      before(function (done) {
        this.config = new Config('./config/right_config.json', done)
      })

      it('correct parse \'HOSTNAME\'', function () {
        expect(this.config.get('HOSTNAME')).to.equal('http://ya.ru');
      })

      it('correct parse \'PORT\'', function () {
        expect(this.config.get('PORT')).to.equal('8085');
      })

      it('correct parse \'LOGIN\'', function () {
        expect(this.config.get('LOGIN')).to.equal('admin123');
      })

      it('correct parse \'PASSWORD\'', function () {
        expect(this.config.get('PASSWORD')).to.equal('1234');
      })

      it('correct parse \'CSS_PREPROC_MAP\'', function () {
        expect(this.config.get('CSS_PREPROC_MAP')).to.equal('.preproc_config123');
      })

      it('correct parse \'MATCH_ROOT\'', function () {
        expect(this.config.get('MATCH_ROOT')).to.deep.equal(new RegExp('c://'));
      })

      it('correct parse \'INTERVAL\'', function () {
        expect(this.config.get('INTERVAL')).to.equal(100);
      })

      it('correct parse \'ENABLE_PREPROC\'', function () {
        expect(this.config.get('ENABLE_PREPROC')).to.be.false;
      })

      it('correct parse \'IGNORE\'', function () {
        expect(this.config.get('IGNORE')).to.deep.equal(new RegExp('.git'));
      })
    })

    describe('if config wrong, ', function () {
      before(function (done) {
        this.config = new Config('./config/wrong_config.json', done)
      })

      it('use default \'HOSTNAME\'', function () {
        expect(this.config.get('HOSTNAME')).to.equal('localhost');
      })

      it('use default \'PORT\'', function () {
        expect(this.config.get('PORT')).to.equal('4502');
      })

      it('use default \'LOGIN\'', function () {
        expect(this.config.get('LOGIN')).to.equal('admin');
      })

      it('use default \'INTERVAL\'', function () {
        expect(this.config.get('INTERVAL')).to.equal(500);
      })

      it('use default \'ENUBLE_PREPROC\'', function () {
        expect(this.config.get('ENABLE_PREPROC')).to.equal(false);
      })
    })
  });
});



