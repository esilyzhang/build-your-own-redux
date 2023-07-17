/**
 * 组合中间件函数
 * @param {Array<Function>} 任意数量的函数
 * @returns {Function} 嵌套执行的函数
 */
function compose(...fns) {
  if (!fns.length) {
    return (arg) => arg;
  }
  return fns.reduce((a, b) => (arg) => a(b(arg)));
}

/**
 * 创建修改源 CreateStore 函数（插件）
 * @param {Array<Function>} middlewares 中间件函数，执行创建 store 实例时，包裹创建源dispatch的函数
 * @returns {Function}
 */
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer) => {
    const store = createStore(reducer);
    const middlewareApi = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const dispatchChain = middlewares.map((middleware) =>
      middleware(middlewareApi)
    );
    const composeMiddleware = compose(...dispatchChain);
    const dispatch = composeMiddleware(store.dispatch);
    return {
      ...store,
      dispatch,
    };
  };
}

/**
 * 创建一个 Store
 * @param {Function} reducer 状态变更函数 比如：
 * function reducer(state, action) {
 *   switch (action){
 *     case "add":
 *       state.value++
 *       break;
 *     default:
 *       break
 *   }
 *   return state
 * }
 * @params {Function} enhancer 可以修改createStore默认行为的函数
 */
function createStore(reducer, enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer);
  }
  let state = reducer(undefined, { type: "@@INIT" });
  const listeners = [];
  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (listener) => {
      listeners.push(listener);
    },
  };
}

export default {
  createStore,
  applyMiddleware,
};
