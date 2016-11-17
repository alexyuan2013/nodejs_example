### 1. exports和module.exports

模块最终导出的是module.exports，而exports实际上只是对module.exports的一个全局引用，所以如果把exports赋值为别的，就打破了module.exports和exports之间的引用的关系。可是因为真正导出的是module.exports，那样exports就不能用了，因为它不再指向exports了。如果想要维持那个链接，可以向下面这样让module.exports再次引用exports：

```javas
module.exports = exports = SomeFunc;
```

