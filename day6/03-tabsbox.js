var that;
class Tab {
    constructor(id) {
        that = this;
        // 获取元素
        this.main = document.querySelector(id);
        this.ul = this.main.querySelector('ul');
        this.lis = this.main.querySelectorAll('li');
        this.sections = this.main.querySelectorAll('section');
        this.addtab = this.main.querySelector('.tabadd');
        this.init();
    }

    init() {
        // init 初始化操作让相关元素绑定事件
        this.addtab.onclick = this.addTab;
        for (var i = 0; i < this.lis.length; i++) {
            this.lis[i].index = i;
            this.lis[i].onclick = this.toggleTab;
        }
    }

    // 1.切换功能
    toggleTab() {
        that.clearClass();
        this.className = 'liactive';
        that.sections[this.index].className = 'conactive';
    }
    clearClass() {
        for (var i = 0;i < this.lis.length;i ++) {
            this.lis[i].className = '';
            this.sections[i].className = '';
        }
    }
    // 2.添加功能
    addTab() {
        // (1) 创建li元素和section元素
        let li = '<li><span>测试</span></li>'
        that.ul.insertAdjacentHTML('beforeend', li);
    }
    // 3.删除功能
    removeTab() {}
    // 4.编辑功能
    editTab() {}
}

var tab = new Tab('#tab');