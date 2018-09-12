function IndexController() {
  this.index = function (req, resp) {
    resp.writeHead(200, { 'Content-type': 'text/html; charset=utf-8' });
    resp.write(
      `<form action="/search" method="get">
        <input style="width: 100%; height: 8%" type="text" placeholder="搜索电影" name="sw"><br>

        <input style="width: 30%; height: 12%; margin: 8% 30%" type="submit" value="SEARCH" >

      </form>
      `
    );
    resp.end();
  }
}

module.exports = IndexController;
