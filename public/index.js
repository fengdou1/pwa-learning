(function() {
    /**
     * 生成书籍列表卡片（dom元素）
     * @param {Object} book 书籍相关数据
     */
    function createCard(book) {
        var li = document.createElement('li');
        // var img = document.createElement('img');
        var title = document.createElement('div');
        var author = document.createElement('div');
        var desc = document.createElement('div');
        var publisher = document.createElement('span');
        var price = document.createElement('span');
        title.className = 'title';
        author.className = 'author';
        desc.className = 'desc';
        // img.src = book.image;
        title.innerText = book.name;
        author.innerText = book.type;
        publisher.innerText = book.thumbnail;
        desc.innerText = book.text;

        book.publisher && desc.appendChild(publisher);
        book.price && desc.appendChild(price);
        // li.appendChild(img);
        li.appendChild(title);
        li.appendChild(author);
        li.appendChild(desc);

        return li;
    }

    /**
     * 根据获取的数据列表，生成书籍展示列表
     * @param {Array} list 书籍列表数据
     */
    function fillList(list) {
        list.forEach(function (book) {
            var node = createCard(book);
            document.querySelector('#js-list').appendChild(node);
        });
    }

    /**
     * 控制tip展示与显示的内容
     * @param {string | undefined} text tip的提示内容
     */
    function tip(text) {
        if (text === undefined) {
            document.querySelector('#js-tip').style = 'display: none';
        }
        else {
            document.querySelector('#js-tip').innerHTML = text;
            document.querySelector('#js-tip').style = 'display: block';
        }
    }

    /**
     * 控制loading动画的展示
     * @param {boolean | undefined} isloading 是否展示loading
     */
    function loading(isloading) {
        if (isloading) {
            tip();
            document.querySelector('#js-loading').style = 'display: block';
        }
        else {
            document.querySelector('#js-loading').style = 'display: none';
        }
    }
        /**
     * 获取该请求的缓存数据
     * @param {string} url 请求的url
     * @return {Promise}
     */
    function getApiDataFromCache(url) {
        if ('caches' in window) {
            return caches.match(url).then(function (cache) {
                if (!cache) {
                    return;
                }
                return cache.json();
            });
        }
        else {
            return Promise.resolve();
        }
    }
    /**
     * 根据用户输入结果
     * 使用XMLHttpRequest查询并展示数据列表
     */
    function queryBook() {

        var input = document.querySelector('#js-search-input');
        var query = input.value;

        var page = query, count = 20;

        var xhr = new XMLHttpRequest();
        var url = '/book?page=' + page + '&count=' + count;
        var cacheData;

        document.querySelector('#js-list').innerHTML = '';
        document.querySelector('#js-thanks').style = 'display: none';
        loading(true);

        var remotePromise = getApiDataRemote(url); // 真实数据的promise
        
        getApiDataFromCache(url).then(function (response) {
            if (response) {
                loading(false);
                input.blur();            
                fillList(response.result);
                document.querySelector('#js-thanks').style = 'display: block'; 
            }
            cacheData = response || {};
            return remotePromise;

        }).then(function (data) {
            console.log("getApiDataFromCache-then");
            if (data && (JSON.stringify(data) !== JSON.stringify(cacheData))) { 
                loading(false);                
                input.blur();
                fillList(data.result);
                document.querySelector('#js-thanks').style = 'display: block';
            }
        });
      
    }
    function getApiDataRemote(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 60000;
            xhr.onreadystatechange = function () {
                var response = {};
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        response = JSON.parse(xhr.responseText);
                    }
                    catch (e) {
                        response = xhr.responseText;
                    }
                    resolve(response);
                }
                else if (xhr.readyState === 4) {
                    resolve();
                }
            };
            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;
            xhr.open('GET', url, true);
            xhr.send(null);
        });
    }
    document.querySelector('#js-getMessage-btn').addEventListener('click', function () {
     
        var xhr = new XMLHttpRequest();
        var url = '/randomMessage';
        
     
      
        xhr.timeout = 60000;
        xhr.onreadystatechange = function () {
            var response = {};
            if (xhr.readyState === 4 && xhr.status === 200) {
                loading(false);
                try {
                    response = JSON.parse(xhr.responseText);
                }
                catch (e) {
                    response = xhr.responseText;
                }
                
                console.log(response);
                innerHtmlMsg(response.result.from, response.result.name);
 
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    })

    function innerHtmlMsg(from, name) {
        document.querySelector("#TipMessage").innerHTML = "";
        document.querySelector("#TipMessage").innerHTML +=(from+name);
       
    }

    /**
     * 监听“搜索”按钮点击事件
     */
    document.querySelector('#js-search-btn').addEventListener('click', function () {
        queryBook();
    });

    /**
     * 监听“回车”事件
     */
    window.addEventListener('keypress', function (e) {
        if (e.keyCode === 13) {
            queryBook();
        }
    });

    function registerServiceWorker(file) {
        return navigator.serviceWorker.register(file);
    }
        
    if ("serviceWorker" in navigator && "PushManager" in window) {
        var publicKey = 'BNzbmU415CQnqE7LKI1NpciuSTY3QVWO1dXteCQCU3qoBI0e9gwFKYXj4mCAJlaYnyylOERy8UbCAYmwjrlJDkA'
     
        registerServiceWorker("./sw.js").then((registration) => {
            
            // 获取用户授权
            return Promise.all([
                registration,
                askPermission()
            ])

        }).then(function (result) {
            var registration = result[0];
            // 添加提醒功能
            document.querySelector('#js-notification-btn').addEventListener('click', function () {
                var title = "提示消息题目";
                var options = {
                    body: '邀请你一起学习',
                    icon: '/img/book.png',
                    actions: [{
                        action: 'show-book',
                        title: '去看看'
                    }, {
                        action: 'contact-me',
                        title: '联系我'
                    }],
                    tag: 'pwa-starter',
                    renotify: true
                }
                registration.showNotification(title, options);
            })

            
            console.log('Service Worker 注册成功');
            return subscribeUserToPush(registration, publicKey);
        }).then(function (subscription) {
            console.log(subscription)
            var body = {
                subscription: subscription,
                uniqueid: new Date().getTime()
            };
              console.log('uniqueid', body.uniqueid);
            // 为了方便之后的推送，为每个客户端简单生成一个标识
            return sendSubscriptionToServer(JSON.stringify(body));
        }).then(function (res) {
            console.log(res);
        }).catch(function (err) {
            console.log(err);
        })
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function (e) {
            var action = e.data;
            console.log(`receive post-message from sw, action is '${e.data}'`);
            switch (action) {
                case 'show-book':
                    location.href = 'https://book.douban.com/subject/20515024/';
                    break;
                case 'contact-me':
                    location.href = 'mailto:852579110@qq.com';
                    break;
                default:
                    document.querySelector('.panel').classList.add('show');
                    break;
            }
        });
    }


    // 浏览器（客户端）生成subscription信息
    function subscribeUserToPush(registration, publicKey) {
        var subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: window.urlBase64ToUint8Array(publicKey)
        }; 
        return registration.pushManager.subscribe(subscribeOptions).then(function (pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        });
    }

    function sendSubscriptionToServer(body, url="/subscription") {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 60000;
            xhr.onreadystatechange = function () {
                var response = {};
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response = xhr.responseText;
                    }
                    resolve(response);
                } else if (xhr.readyState === 4) {
                    resolve();
                }
            }
            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;
            xhr.open('POST', url, true); //第三个参数 异步
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(body);        
        })
    }

    function askPermission() {
        var permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        })
    }


    /**
     * 获取用户授权，将
     */
    function askPermission() {
        return new Promise(function (resolve, reject) {
            var permissionResult = Notification.requestPermission(function (result) {
                resolve(result);
            });

            if (permissionResult) {
                permissionResult.then(resolve, reject);
            }
        }).then(function (permissionResult) {
            if (permissionResult !== 'granted') {
                throw new Error('We weren\'t granted permission.');
            }
        })
    }
    /* ========================================== */
    /* ================== fin =================== */
    /* ========================================== */



    
    /* ========================================== */
    /*   service worker background sync 相关部分   */
    /* ========================================== */
    var STORE_NAME = 'SyncData_1';
    if ('serviceWorker' in navigator && 'SyncManager' in window) {

        // 一个background sync的基础版
        navigator.serviceWorker.ready.then(function (registration) {
            var tag = 'sample_sync'; 
            document.getElementById('js-sync-btn').addEventListener('click', function () {
                registration.sync.register(tag).then(function () {
                    console.log('后台同步已触发', tag);
                }).catch(function (err) {
                    console.log('后台同步触发失败', err);
                })
            })
        });

        // 使用postMessage来传输sync数据
        navigator.serviceWorker.ready.then(function (registration) {
            var tag = 'sample_sync_event';

            document.getElementById('js-sync-event-btn').addEventListener('click', function () {
                registration.sync.register(tag).then(async function () {
                    // 使用postMessage进行数据通信
                    var inputValue = document.querySelector('#js-search-input').value;

                    var msg = JSON.stringify({ type: 'bgsync', msg: { name: inputValue } });
                    
                    var aaa= await navigator.serviceWorker.controller.postMessage(msg);
                    console.log(aaa)
                }).catch(function (err) {
                    console.log('后台同步触发失败', err);
                });
            })
        })

        // 使用indexedDB来传输sync数据
        navigator.serviceWorker.ready.then(function (registration) {
            return Promise.all([
                openStore(STORE_NAME),
                registration
            ]);
        }).then(function (result) {
            var db = result[0];
            var registration = result[1];
            var tag = 'sample_sync_db';
            console.log(333)
            document.getElementById('js-sync-db-btn').addEventListener('click', function () {
                // 将数据存储进indexedDB
                var inputValue = document.querySelector('#js-search-input').value;
                var tx = db.transaction(STORE_NAME, 'readwrite');
                console.log(123)
                var store = tx.objectStore(STORE_NAME);
                var item = {
                    tag: tag,
                    name: inputValue
                };
                store.put(item);

                registration.sync.register(tag).then(function () {
                    console.log('后台同步已触发', tag);
                }).catch(function (err) {
                    console.log('后台同步触发失败', err);
                });
            });
        });
 
    }

    /* ========================================== */
    /* ================== fin =================== */
    /* ========================================== */


    /**
     * 连接并打开存储，使用indexedDB
     * @param {string} storeName 存储的名称
     * @return {Promise}
     */
function openStore(storeName) {
    return new Promise(function (resolve, reject) {
        if (!('indexedDB' in window)) {
            reject('don\'t support indexedDB');
        }
        var request = indexedDB.open('PWA_DB', 1);
        request.onerror = function(e) {
            console.log('连接数据库失败');
            reject(e);
        }
        request.onsuccess = function(e) {
            console.log('连接数据库成功');
            resolve(e.target.result);
        }
        request.onupgradeneeded = function (e) {
            console.log('数据库版本升级');
            var db = e.srcElement.result;
            if (e.oldVersion === 0) {
                if (!db.objectStoreNames.contains(storeName)) {
                    var store = db.createObjectStore(storeName, {
                        keyPath: 'tag'
                    });
                    store.createIndex(storeName + 'Index', 'tag', {unique: false});
                    console.log('创建索引成功');
                }
            }
        }
    });
}
 
})();