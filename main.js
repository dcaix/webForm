
$(function(){
  leipiEditor.ready(function(){
    // 默认显示内容必须在实例化编辑器之后才能显示
    leipiEditor.setContent('欢迎使用webForm问卷调查编辑器')
  })

})
var leipiEditor = UE.getEditor('myFormDesign',{
  allowDivTransToP: false,//阻止转换div 为p
  toolleipi:true,//是否显示，设计器的 toolbars
  textarea: 'design_content',   
  //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
 toolbars:[[
  'fullscreen','background' ,'source','|', 'undo', 'redo', '|','bold', 'italic', 'underline', 'fontborder', 'strikethrough',  'removeformat', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist','|', 'fontfamily', 'fontsize', '|', 'indent', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',  'link', 'unlink',  '|',  'horizontal',  'spechars',  'wordimage', '|', 'inserttable', 'deletetable',  'mergecells',  'splittocells','drafts','help']],
  //focus时自动清空初始化时的内容
  //autoClearinitialContent:true,
  //关闭字数统计
  wordCount:false,
  //关闭elementPath
  elementPathEnabled:false,
  //默认的编辑区域高度
  initialFrameHeight:500
  //,iframeCssUrl:"css/bootstrap/css/bootstrap.css" //引入自身 css使编辑器兼容你网站css
  //更多其他参数，请参考ueditor.config.js中的配置项
});



var leipiFormDesign = {
/*执行控件*/
exec : function (method) {
leipiEditor.execCommand(method);
},
/*type  =  save 保存设计 versions 保存版本  close关闭 */
fnCheckForm : function ( type ) {
if(leipiEditor.queryCommandState( 'source' ))
  leipiEditor.execCommand('source');//切换到编辑模式才提交，否则有bug
  
if(leipiEditor.hasContents()){
  leipiEditor.sync();/*同步内容*/
if( typeof type!=='undefined' ){
      type_value = type;
  }
  //获取表单设计器里的内容并校验规则
var data =  checkRule()
if(!data.code){
  alert(data.message)
  return false
}else{
  alert('表单校验已通过，可以保存，保存请自行处理')
}

} else {
  alert('表单内容不能为空！')
  $('#submitbtn').button('reset');
  return false;
}
} ,
/*预览表单*/
fnReview : function (){
if(leipiEditor.queryCommandState( 'source' ))
  leipiEditor.execCommand('source');/*切换到编辑模式才提交，否则部分浏览器有bug*/
  
if(leipiEditor.hasContents()){
  leipiEditor.sync();       /*同步内容*/
  //获取表单设计器里的内容并校验规则
  var data =  checkRule()
  if(!data.code){
    alert(data.message)
    return false
  }
 
  localStorage.setItem('formData',data.message)
  window.open('./view.html');
} else {
  alert('表单内容不能为空！');
  return false;
}
}
};

function checkRule(){

 var formData = leipiEditor.getContent()

 if(formData.match(/script/i)){
  return {code:false,message:'问卷有不规范标签，请按规则编辑问卷'}
} 

var container = $('#container').html(formData)
console.log(container)
var leipiplugins = container.find('[leipiplugins]')
var box = container.children('.questionBox')
console.log(leipiplugins)
console.log(box)
var flag = false
var num;
function flags(i){
  flag= true
  num = i+1
  return false
}

// 验证题型是否按规则放入问题类型框
leipiplugins.each(function(i,ele){
var hasBox = $(ele).parents('.questionBox').length
if(!hasBox){
  flag= true
  return false
}
})
if(flag){
  return {code:false,message:'有题组未包含在问题类型框内，请检查并按规则添加相应类型框'}
}
// 问卷类型框嵌套验证
box.each(function(i,ele){
var  hasNest = $(ele).find('.questionBox').length
  if(hasNest){
    flags(i)
  }
})
if(flag){
  return {code:false,message:'第'+num + '个问卷类型框不得相互嵌套，请按规则编辑问卷'}
}

// 校验问题类型框下不能为空
box.each(function(i,ele){
var  isEmpty = $(ele).find('[leipiplugins]').length
  if(!isEmpty){
    flags(i)
  }
})
if(flag){
  return {code:false,message:'第'+num + '个问卷类型框请添加问题题组，不能为空'}
}


// 所选问卷类型框必须与实际问卷类型一致 校验
box.each(function(i,ele){
  var parType =  $(ele).attr('questiontype')
  var leipiplugins = $(ele).find('[leipiplugins]')
  for(var k =0; k<leipiplugins.length; k++){
    var chilType = $(leipiplugins[k]).attr('leipiplugins')
    switch(chilType){
      case 'radios':
      if(parType !== 'radio'){ 
        flags(i)
      }
      break;
      case 'checkboxs':
      if(parType !== 'checkbox' && parType !== 'complexCheckbox'){
        flags(i)
      }
      break;
      case 'checkbox':
      if(parType !== 'complexCheckbox' && parType !== 'complexJudges'){
        flags(i)
      }
      break;
      case 'judge':
      if(parType !== 'judges' && parType !== 'complexJudges' ){
        flags(i)
      }
      break;
    }
    if(parType === 'sAnswer' && chilType !== 'text'){
      flags(i)
   }
  }
})
if(flag){
  return {code:false,message:'第'+num + '个问卷类型框与实际问卷类型不一致，请按规则编辑问卷'}
 }


 //因手动换行引起的组件嵌套 评分项嵌套会引起收集结果异常，"其他未做校验" 校验
box.each(function(i,ele){
  var leipiplugins = $(ele).find('[leipiplugins]')
  for(var k =0; k<leipiplugins.length; k++){
    var chilType = $(leipiplugins[k]).attr('leipiplugins')
    if(chilType === 'judge' && $(leipiplugins[k]).find('[leipiplugins]').length){
      flags(i)
    }
    if(chilType === 'judge' && !$(leipiplugins[k]).find('input').length){
      flags(i)
    }
  }
})

 if(flag){
 return {code:false,message:'第'+num+'个问卷类型框存在评分空组件，是否按规则不能手动换行等'}
 }

 //   去除表单元素的disable属性   
var data = formData.replace(/disabled="disabled"/g,'')
return {code:true,message:data}
}