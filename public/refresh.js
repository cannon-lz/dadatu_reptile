function enable() {
  console.log('enable');
  // 打开下拉刷新模式
  //  onRefresh 该参数可选，如果传入此参数需要在onRefresh函数中实现具体的刷新逻辑。默认的刷新逻辑是重新加载了一次页面
  bxJsBridge.setMode(JSON.stringify({
    mode: 'pullFromStart',
    onRefreshComplete: 'onRefreshComplete',
    // onRefresh: 'onRefresh'
  }))
}

function onRefreshComplete() {
  console.log('刷新完成');
  // TODO 刷新完毕，可以在这里执行提示刷新完成的逻辑

}

enable();
