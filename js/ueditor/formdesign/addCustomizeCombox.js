function addBox (value,type){
  return '<div style="border: 1px solid rgb(0, 0, 0);margin-top:3px;" class="questionBox" questionType = "'+ type +'"> <p>'+ value+'</p></div>'
}

UE.registerUI('问题类型',function(editor,uiName){
  //注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
  editor.registerCommand(uiName,{
      execCommand:function(cmdName,value){
          switch(value){
            case '多选判断':
            this.execCommand('insertHtml',addBox(value,'complexCheckbox'))   
            break;
            case '评分题':
            this.execCommand('insertHtml',addBox(value,'judges'))
            break;
            case '评分判断':
            this.execCommand('insertHtml',addBox(value,'complexJudges'))
            break;
            case '纯问答题':
            this.execCommand('insertHtml',addBox(value,'sAnswer'))
            break;
            case '单选题':
            this.execCommand('insertHtml',addBox(value,'radio'))
            break;
            case '多选题':
            this.execCommand('insertHtml',addBox(value,'checkbox'))
            break;
          }   
      }
  })


  //创建下拉菜单中的键值对，这里我用字体大小作为例子
  var items = [];
  for(var i= 0,ci;ci=['单选题', '多选题','纯问答题','多选判断', '评分题','评分判断'][i++];){
      items.push({
          //显示的条目
          label:ci,
          //选中条目后的返回值
          value:ci,
          //针对每个条目进行特殊的渲染
          renderLabelHtml:function () {
              //这个是希望每个条目的字体是不同的
              return '<div class="edui-label %%-label">' + (this.label || '') + '</div>';
          }
      });
  }
  //创建下来框
  var combox = new UE.ui.Combox({
      //需要指定当前的编辑器实例
      editor:editor,
      //添加条目
      items:items,
      //当选中时要做的事情
      onselect:function (t, index) {
          //拿到选中条目的值
          editor.execCommand(uiName, this.items[index].value);
      },
      //提示
      title:uiName,
      //当编辑器没有焦点时，combox默认显示的内容
      initValue:uiName
  });
  return combox;
},1/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);