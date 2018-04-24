$(function() {
  $('form').html(localStorage.getItem('formData')) 
  addName()

  checkForm()

})

// 给评分组动态添加 name 属性
function judgeName(ele, fatherIndex) { 
  $(ele)
    .find('label.judge')
    .each(function(i, ele) {
      //  这里是 p
      var judgeFatherIndex = i
      $(ele)
        .find('input')
        .each(function(i, ele) {
          //  这里是input
          $(ele).attr('name', fatherIndex + '-' + judgeFatherIndex)
        })
    })
}

// 给所有问答动态添加 name 属性及绑定特殊事件以控制和获取表单值
function addName() {
  // 获得所有的问卷题目个数
  var box = $('.questionBox')
  // 去除黑边框
  box.attr('style','')
  // // 给所有问答动态添加 name 属性及绑定特殊事件以控制和获取表单值
  box.each(function(i, ele) {
    var questiontype = $(ele).attr('questiontype')
    var fatherIndex = i + 1
    switch (questiontype) {
      // 简单评分组
      case 'judges':
      // 给评分组添加 name 属性
        judgeName(this, fatherIndex)
        break
      // 复杂评分
      case 'complexJudges':
       // 给评分组添加 name 属性
        judgeName(this, fatherIndex)
     
// 给有否定选项的复杂评分组绑定避免冲突事件
        var $father = $(this)

        $father
          .find('.complexCheckbox')
          .attr({
            name: fatherIndex,
            value: 'negate',
          })
          .on('click', function() {
            if ($(this).prop('checked')) {
              $father.find('.judge input').prop('checked', false)
            }
          })
        $father.find('.judge input').on('click', function() {
          if ($(this).prop('checked')) {
            $father.find('.complexCheckbox').prop('checked', false)
          }
        })
        break
      // 多选判断
      case 'complexCheckbox':
     
        $this = $(this)
        // 给多选题组添加 name 属性
        $this.find('input').each(function(i, ele) {
          $(ele).attr('name', fatherIndex)
        })
         // 给有否定选项的多选绑定避免冲突事件
        $this
          .find('.complexCheckbox')
          .attr({
            value: 'negate',
          })
          .on('click', function() {
            if ($(this).prop('checked')) {
              $this
                .find('label[leipiplugins="checkboxs"]')
                .find('input')
                .prop('checked', false)
            }
          })

        $this
          .find('label[leipiplugins="checkboxs"]')
          .find('input')
          .on('click', function() {
            if ($(this).prop('checked')) {
              $this.find('.complexCheckbox').prop('checked', false)
            }
          })
        break
      default:
        // 其他类型只有一层 input 直接添加统一name
        $(ele)
          .find('input')
          .each(function(i, ele) {
            $(ele).attr('name', fatherIndex)
          })
        break
    }

         // 如果有问答题,给问答题绑定 name 属性
         if( $(ele).find('input[type="text"]')){
          $(ele).find('input[type="text"]').attr('name', fatherIndex+'Que')
        }
  })
}

function getData(fn) {
  
  $('#submit').on('click', function() {
    var resultData = []
    var judgeS = {}

    var serializeArray = $('form').serializeArray()

    // 数据处理
    $.each(serializeArray, function(i, val) {
      var titNum = val.name.split('-')[0]

       // 保证评分题4个必须全选,需要优先校验
          // 判断找出勾选过评分项的评分题,并统计总共有多少个需要评分的
     if( val.name.indexOf('-') !== -1){
       var len =  $('.questionBox').eq(titNum-1).find('label.judge').length     
        judgeS[titNum] = len
     }
   
      if (!resultData.length) {
        resultData[0] = { titNum: titNum, val: val.value }
      } else {
        var flag = 0
        var index
        $.each(resultData, function(i, val) {
          if (titNum === val.titNum) {
            flag = titNum
            index = i
            return
          }
        })
        if (flag) {
          var frontVal = resultData[index].val
          resultData[index] = { titNum: titNum, val: frontVal + ';' + val.value }
        } else {
          resultData.push({ titNum: titNum, val: val.value })
        }
      }
    })

    fn(resultData,judgeS)
    return false;
  })
}

// 校验表单完整性
function checkForm(){
  var box = $('.questionBox')
  var len = box.length
  // 找到 纯问答题 及其位置号
  var sAnswer = []
  box.each(function(i, ele) {
    if($(ele).attr('questiontype') === 'sAnswer'){
      sAnswer.push(i+1)
    }
  })
  // 获取提交表单的数据
  getData(function(data,judgeS){
    console.log(data)
    console.log(judgeS)
    // 清除所有未勾选选项的提示 class
    $('.questionBox').removeClass("warn")
    var isComplete = true
    var goto = []
    for(var i =1 ;i<len+1;i++){
     var flag = false

    // 判断是不是单纯简单题,如果是,跳过检验
     var isAnswer = false
     $.each(sAnswer, function(j, va) { 

     if(i === va){
      isAnswer = true
     } 
  })
  if(isAnswer){
    continue
  }
  // 校验非简单题的答案是否完整

  $.each(data, function(k, va) {
    for(var judgeSk in judgeS){
     if(judgeSk === va.titNum.toString() && va.val.split(';').length !== judgeS[judgeSk] ){
      return
     }
    }

    if(va.titNum === i.toString() ){
         flag = true
         return
    } 
})
 
    if(!flag){
      isComplete = flag
      goto.push(i)
     $('.questionBox').eq(i-1).addClass("warn")
    }
   }

  if(!isComplete){
    alert('请完整填写问卷调查')
    $("html,body").animate({scrollTop:$('.questionBox').eq(goto[0]-1).offset().top},600)
    return
  }
      // 弹窗结果处理,给预览窗口演示
      var str = ''
      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          str += ('第'+data[i].titNum+'题: '+ data[i].val+'\n')
          data[i];  
        }
      }
      alert(str)
 })

}