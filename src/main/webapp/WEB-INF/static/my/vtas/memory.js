//init functions
$(function(){
	programSelect();

	$('#programSelect').change(function(){
		var program = $('#programSelect').val();
		var arrayName = $('#arrayName').val();
		$('#arrayName').empty();
		$("#buildVersion").select2({data:""});
		$('#buildVersion').empty();
		arraySelect(program);
	});
	
	$('#arrayName').change(function(){
		var program = $('#programSelect').val();
		var arrayName = $('#arrayName').val();
		$('#buildVersion').empty();
		buildSelect(program,arrayName);
	});
	
	$('input[name="reservationtime"]').daterangepicker({
		timePicker: true,
		timePickerIncrement: 30,
		timePicker24Hour:true,
		locale: {
			format: 'YYYY-MM-DD HH:mm:ss'
		}
	});
	
})

function formatDateTime(inputTime) {    
    var date = new Date(inputTime);  
    var y = date.getFullYear();    
    var m = date.getMonth() + 1;    
    m = m < 10 ? ('0' + m) : m;    
    var d = date.getDate();    
    d = d < 10 ? ('0' + d) : d;    
    var h = date.getHours();  
    h = h < 10 ? ('0' + h) : h;  
    var minute = date.getMinutes();  
    var second = date.getSeconds();  
    minute = minute < 10 ? ('0' + minute) : minute;    
    second = second < 10 ? ('0' + second) : second;   
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;    
};

function generateUrl(){
	var timerange = $("#reservationtime").val();
	var tableName = $('#programSelect').val() || '';
	var arrayName = $('#arrayName').val() || '';
	var smallVersion = $('#buildVersion').val() || '';
	var timeArr;
	var beginTime;
	var endTime;
	var dataUrl;
	if(tableName==''||arrayName==''||smallVersion==''){
		layer.alert('Please select program,array,build', {icon: 0,title:'Major',closeBtn: 0,skin: 'layui-layer-molv'});
		return;
	}
	if(timerange==null||timerange==''){
		dataUrl = "/vtas/arraymonitor/getMemoryList/"+tableName+"/"+arrayName+"/"+smallVersion;
	}else{
		timeArr = timerange.split(" - ");	
		beginTime = timeArr[0];
		endTime = timeArr[1];
		dataUrl = "/vtas/arraymonitor/getMemoryList/"+tableName+"/"+arrayName+"/"+smallVersion+"?beginTime="+beginTime+"&endTime="+endTime;
	}
	return dataUrl;
}

function programSelect(){
	
	$('#programSelect').select2({
		placeholder: 'Select Release',
		ajax: {
			cache:true,
		    url: '/vtas/arraymonitor/getPrograms',
		    processResults: function (data) {
		      return {
		        results: data
		      };
		    }
		  }
    });
}


function arraySelect(tableName){
	
	$('#arrayName').select2({
		placeholder: 'Select Array',
		allowClear:true,
		ajax: {
			cache:true,
		    url: '/vtas/arraymonitor/getDistinctArrayList/'+tableName+'/',
		    processResults: function (data) {
		      return {
		        results: data
		      };
		    }
		  }
    });	
}

function buildSelect(tableName,arrayName){
	
	$('#buildVersion').select2({
		placeholder: 'Select Build',
		allowClear:true,
		ajax: {
		    url: '/vtas/arraymonitor/getDistinctVersionByArray/'+tableName+'/'+arrayName,
		    processResults: function (data) {
		      return {
		        results: data
		      };
		    }
		  }
    });	
}




function viewMemory(){
	require.config({
	    paths: {
	        echarts: '/plugins/echart/dist'
	    }
	});
	require(
		    [
		        'echarts',
		        'echarts/chart/line', // 使用柱状图就加载bar模块，按需加载
		        'echarts/chart/bar'
		        ],
			function (ec) {
			 var dataUrl = generateUrl();
			 var Chart=ec.init(document.getElementById("main"));  
			 Chart.showLoading({text: 'Loding...'});  
			 var xAxisData;
			 var legendData=['MemoryUsed','Ktrace_Util','ECOM','CSX_IC_SAFE'];
			 var memoryData=[];
			 var ktraceData=[];
			 var ecomData=[];
			 var csxData=[];
			 var times=[];
			 $.ajax({  
			        url:dataUrl,  
			        dataType:"json",  
			        type:'post',  
			        success:function(result){
			        	if(result==null||result==''){
			        		layer.alert('No data found', {icon: 0,title:'Info',closeBtn: 0,skin: 'layui-layer-molv'});
					 		Chart.hideLoading();
					 	}else{
					 		for(var i=0;i<result.length;i++){
					 			times.push(formatDateTime(result[i]['poll_datetime']));
					 			memoryData.push(result[i]['MEM_USED']);
					 			ktraceData.push(result[i]['ktrace_util']);
					 			ecomData.push(result[i]['ECOM']);
					 			csxData.push(result[i]['csx_ic_safe']);
					 		 }
					 	}
			        	
			        	 var option = {    
					                tooltip: {
					                	trigger: 'axis',
					                    show: true    
					                },    
					                legend: {    
					                    data: legendData    
					                },
					                toolbox: {
					    				show : true,
					    				feature : {
					    				    mark : {show: true},
					    				    dataZoom : {show: true},
					    				    dataView : {show: true},
					    				    magicType : {show: true, type: ['line','bar']},
					    				    restore : {show: true},
					    				    saveAsImage : {show: true}
					    				}
				    				},
				    				calculable : true,
				    				dataZoom : {
				    					show : true,
				    					realtime : true,
				    					start : 20,
				    					end : 80
				    				},
					                xAxis: [    
					                    {    
					                        type: 'category',    
					                        data: times    
					                    }    
					                ],    
					                yAxis: [    
					                    {    
					                        type: 'value'    
					                    }    
					                ],    
					                series: [
					                		{
					                        'name': 'MemoryUsed',    
					                        'type': 'line',
					                        'smooth':true,
					                        'symbol':'none',
					                        'data': memoryData    
					                    	},
					                    	{
						                    'name': 'Ktrace_Util',    
					                        'type': 'line',
					                        'smooth':true,
					                        'symbol':'none',
					                        'data': ktraceData    
					                    	},
					                    	{
					                        'name': 'ECOM',    
					                        'type': 'line',
					                        'smooth':true,
					                        'symbol':'none',
					                        'data': ecomData    
					                    	},
					                    	{
					                        'name': 'CSX_IC_SAFE',
					                        'type': 'line',
					                        'smooth':true,
					                        'symbol':'emptyCircle',
					                        'data': csxData    
					                    	}
					                ]
					            };
						
				        Chart.hideLoading();  
				        Chart.setOption(option);    
			        },
			        error : function() {
						 //请求失败时执行该函数
						 alert("Failed to get ajax data!");
						 Chart.hideLoading();
					 }
			    }); 
		    })
}

