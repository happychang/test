$.ajaxSetup({async: false});

var map,
        currentPlayIndex = false,
        cunli;

var pink1 = "#FFB5C5";
var pink2 = "#EEA9B8";
var gray1 = "#CCCCCC";
var gray2 = "#AAAAAA";
var blue1 = "#66AAFF";
var blue2 = "#4499FF";
var blue3 = "#0080FF";
var blue4 = "#0070FF";
var green1 = "#30FF30";
var green2 = "#00FF00";
var green3 = "#00EE00";
var green4 = "#00DD00";
var yellow1 = "#FFFF40";
var yellow2 = "#FFFF00";
var yellow3 = "#EEEE00";
var yellow4 = "#DDDD00";
var orange1 = "#FF9030";
var orange2 = "#FF8000";
var orange3 = "#EE7700";
var orange4 = "#DD7000";
var red1 = "#FF2020";
var red2 = "#FF0000";
var red3 = "#EE0000";
var red4 = "#DD0000";
var purple1 = "#A020F0";

var days7 = 86400000*7;
var days30 = 86400000*30;
var latestTime = 0;
var lastTime = 0;
var spreadTime = 0;

$.getJSON('http://kiang.github.io/TainanDengueMap/taiwan/Dengue.json', function (data) {
    DengueTW = data;
});

$.getJSON('http://happychang.github.io/fever-data/population.json', function (data) 
{
    population = data;
});

$.getJSON('http://happychang.github.io/fever-data/area.json', function (data) 
{
    area = data;
});


function initialize() {

    /*map setting*/
    $('#map-canvas').height(window.outerHeight / 1.7);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 23.00, lng: 120.20}
    });

    $.getJSON('http://happychang.github.io/fever-data/cunli.json', function (data) {
        cunli = map.data.addGeoJson(topojson.feature(data, data.objects.cunli));
    });

    var areas = [];
    cunli.forEach(function (value) {
        var key = value.getProperty('VILLAGE_ID'),
                countyId = value.getProperty('COUNTY_ID'),
                townId = value.getProperty('TOWN_ID'),
                count = 0;

        if (DengueTW[key]) {
            DengueTW[key].forEach(function (val) {
                var recTime = new Date(val[0]).getTime();
		if( latestTime < recTime )
                {
                    latestTime = recTime;
                }
            });
        }

        if (population[key]) {
	    value.setProperty('pop', population[key]);
        }

        if (area[key]) {
	    value.setProperty('area', area[key]);
        }
    
        if(countyId.length === 2) {
            countyId += '000';
        }
        if(!areas[countyId]) {
            areas[countyId] = value.getProperty('C_Name');
        }
        if(!areas[townId]) {
            areas[townId] = value.getProperty('C_Name') + value.getProperty('T_Name');
        }
    });

    lastTime = latestTime;
    showDateMap(new Date(lastTime), cunli);

    var totalNum = 0, ignoreNum = 0;
    var block = '下面病例數字未包含村里資訊，因此無法在地圖中顯示：<div class="clearfix"><br /></div>';
    $.each(DengueTW, function (k, v) {
        if (k.length !== 11) {
            var num = 0;
            for (i in v) {
		var month = new Date(v[i][0]).getMonth();
            	if( month > 5 )
		{
	                num += v[i][1];
		}
            }
            if (k !== 'total') {
		if( num > 0 )
		{
	                ignoreNum += num;
        	        block += '<div class="col-lg-2">' + areas[k] + ': ' + num + '</div>';
		}
            } else {
                totalNum = num;
            }
        }
    })
    block += '<div class="clearfix"><br /></div>';
    block += '七月起共有病例 ' + totalNum + ' ，無法顯示的數量為 ' + ignoreNum;
    $('div#listNoneCunli').html(block);

    map.data.setStyle(function (feature) {
        var selected = $('input[name="map-type"]:checked').val();
        if( selected == 2 && feature.getProperty('sum') == 0 )
        {
            color = "white";
        }
        else if( selected == 3 )
        {
            if( feature.getProperty('spread') )
            {
                color = ColorBar3(feature.getProperty('spread'), spreadTime);
            }
            else
            {
                color = "white";
            }
        }
        else
        {
            if( $('input[name="map-div"]:checked').val() == 1 )
            {
                color = ColorBar2(feature.getProperty('num'), feature.getProperty('pop'), selected ); 
            }
            else
            {
                color = ColorBar(feature.getProperty('num'), feature.getProperty('area'), selected ); 
            }
        }
        
        return {
            fillColor: color,
            fillOpacity: 0.6,
            strokeColor: 'gray',
            strokeWeight: 1
        }
    });

    map.data.addListener('mouseover', function (event) {
        var Cunli = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {fillColor: 'white'});

        if( $('input[name="map-type"]:checked').val() == 3 && event.feature.getProperty('spread') )
        {
//            if( event.feature.getProperty('spread') && )
            {
                var date = new Date(event.feature.getProperty('spread'));
                if( $('input[name="map-div"]:checked').val() == 1 )
                {
                    area = "/" + event.feature.getProperty('pop') + "人>0.1% " + (date.getMonth()+1) + "-" + date.getDate();
                }
                else
                {
                    area = "/" + event.feature.getProperty('area') + "km2>16 " + (date.getMonth()+1) + "-" + date.getDate();
                }
		density = ", 第" + (date.getTime() - spreadTime)/86400000 + "天";
            }
/*
            else
            {
                if( $('input[name="map-div"]:checked').val() == 1 )
                {
                    area = event.feature.getProperty('pop');
                    density = parseInt(event.feature.getProperty('num') / area * 10000)/100 + '%';
                    area = '/' + area + '人=';
                }
                else
                {
                    area = "";
                }
                density = "";
            }
*/
        }
        else
        {
            if( $('input[name="map-div"]:checked').val() == 1 )
            {
                area = event.feature.getProperty('pop');
                density = parseInt(event.feature.getProperty('num') / area * 10000)/100 + '%';
                area = '/' + area + '人=';
            }
            else
            {
		area = event.feature.getProperty('area');
                //density = parseInt(event.feature.getProperty('num') / area);
                density = parseInt(event.feature.getProperty('num') / area) + ", " + parseInt(event.feature.getProperty('Shape_Area')*10000000)/1000;
                area = '/' + area + 'km2=';
            }
        }


        $('#content').html(Cunli + '：' + event.feature.getProperty('num') + '例(' + area + density + ')').removeClass('text-muted');
    });

    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle();
        $('#content').html('在地圖上滑動或點選以顯示數據.........................').addClass('text-muted');
    });

    map.data.addListener('click', function (event) {
        var Cunli = event.feature.getProperty('VILLAGE_ID');
        var CunliTitle = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
        if ($('#myTab a[name|="' + Cunli + '"]').tab('show').length === 0) {
            $('#myTab').append('<li><a name="' + Cunli + '" href="#' + Cunli + '" data-toggle="tab">' + CunliTitle +
                    '<button class="close" onclick="closeTab(this.parentNode)">×</button></a></li>');
            $('#myTabContent').append('<div class="tab-pane fade" id="' + Cunli + '"><div></div></div>');
            $('#myTab a:last').tab('show');
            createStockChart(Cunli, cunli);
            $('#myTab li a:last').click(function (e) {
                $(window).trigger('resize');
            });
        }
    });
    createStockChart('total', cunli);

    $('#playButton1').on('click', function () {
        var maxIndex = DengueTW['total'].length;
        if (false === currentPlayIndex) {
            currentPlayIndex = 125;
        } else {
            currentPlayIndex += 7;
            $(this).addClass('active disabled').find('.glyphicon').show();
        }

        if (currentPlayIndex < maxIndex) {
            showDateMap(new Date(DengueTW['total'][currentPlayIndex][0]), cunli);
            setTimeout(function () {
                $('#playButton1').trigger('click');
            }, 300);
        } else {
            $(this).removeClass('active disabled').find('.glyphicon').hide();
            currentPlayIndex = false;
            $('#title').html('');
        }
        return false;
    });

    $('#playButton2').on('click', function () {
        var maxIndex = DengueTW['total'].length;
        if (false === currentPlayIndex) {
            currentPlayIndex = 0;
        } else {
            currentPlayIndex += 1;
            $(this).addClass('active disabled').find('.glyphicon').show();
        }

        if (currentPlayIndex < maxIndex) {
            showDateMap(new Date(DengueTW['total'][currentPlayIndex][0]), cunli);
            setTimeout(function () {
                $('#playButton2').trigger('click');
            }, 300);
        } else {
            $(this).removeClass('active disabled').find('.glyphicon').hide();
            currentPlayIndex = false;
            $('#title').html('');
        }
        return false;
    });

/* radio for map type */
    $('#map-all').on('click', function () 
    {
        $('input[name="map-div"]:checked').trigger('click');
    });

    $('#map-30').on('click', function () 
    {
        $('input[name="map-div"]:checked').trigger('click');
    });

    $('#map-7change').on('click', function () 
    {
        $('input[name="map-div"]:checked').trigger('click');
    });

    $('#map-spread').on('click', function () 
    {
        $('input[name="map-div"]:checked').trigger('click');
    });

/* radio for map div */
    $('#map-area').on('click', function () 
    {
        if( $('input[name="map-type"]:checked').val() == 2 )
        {
            $('#color1').html('減少: <span class="colorBox" style="background-color: ' + green1  + ';"></span>8~16' +
				'<span class="colorBox" style="background-color: ' + green2      + ';"></span>16~32' +
				'<span class="colorBox" style="background-color: ' + blue1       + ';"></span>32~64' +
				'<span class="colorBox" style="background-color: ' + blue2       + ';"></span>>64');
            $('#color2').html('持平: <span class="colorBox" style="background-color: ' + yellow1 + ';"></span>-4~+4人' +
				'<span class="colorBox" style="background-color: ' + yellow2     + ';"></span>-8~+8');
            $('#color3').html('增加: <span class="colorBox" style="background-color: ' + orange1 + ';"></span>8~16' +
				'<span class="colorBox" style="background-color: ' + orange2     + ';"></span>16~32' +
				'<span class="colorBox" style="background-color: ' + red1        + ';"></span>32~64' +
				'<span class="colorBox" style="background-color: ' + red2        + ';"></span>64~128' +
				'<span class="colorBox" style="background-color: ' + purple1     + ';"></span>>128');
        }
        else if( $('input[name="map-type"]:checked').val() == 3 )
        {
            $('#color1').html('週數: <span class="colorBox" style="background-color: ' + purple1 + ';"></span>0'+
	    			'<span class="colorBox" style="background-color: ' + red4        + ';"></span>1' +
				'<span class="colorBox" style="background-color: ' + red3        + ';"></span>2' +
				'<span class="colorBox" style="background-color: ' + red2        + ';"></span>3' +
				'<span class="colorBox" style="background-color: ' + red1        + ';"></span>4' +
	    			'<span class="colorBox" style="background-color: ' + orange4     + ';"></span>5' +
				'<span class="colorBox" style="background-color: ' + orange3     + ';"></span>6' +
				'<span class="colorBox" style="background-color: ' + orange2     + ';"></span>7' +
				'<span class="colorBox" style="background-color: ' + orange1     + ';"></span>8');
	    $('#color2').html('<span class="colorBox" style="background-color:   ' + yellow4     + ';"></span>9' +
				'<span class="colorBox" style="background-color: ' + yellow3     + ';"></span>10' +
				'<span class="colorBox" style="background-color: ' + yellow2     + ';"></span>11' +
				'<span class="colorBox" style="background-color: ' + yellow1     + ';"></span>12' +
           			'<span class="colorBox" style="background-color: ' + green4      + ';"></span>13' +
				'<span class="colorBox" style="background-color: ' + green3      + ';"></span>14' +
				'<span class="colorBox" style="background-color: ' + green2      + ';"></span>15' +
				'<span class="colorBox" style="background-color: ' + green1      + ';"></span>16');
	    $('#color3').html('<span class="colorBox" style="background-color: '   + blue4       + ';"></span>17' +
				'<span class="colorBox" style="background-color: ' + blue3       + ';"></span>18' +
				'<span class="colorBox" style="background-color: ' + blue2       + ';"></span>19' +
				'<span class="colorBox" style="background-color: ' + blue1       + ';"></span>20' +
				'<span class="colorBox" style="background-color: ' + gray1       + ';"></span>>21');
        }
        else
        {
            $('#color1').html('人數: <span class="colorBox" style="background-color: white;"></span>0' +
				'<span class="colorBox" style="background-color: ' + blue1      + ';"></span>1人' +
				'<span class="colorBox" style="background-color: ' + blue2      + ';"></span>2~4人');
            $('#color2').html('密度: <span class="colorBox" style="background-color: ' + green1 + ';"></span><16' +
				'<span class="colorBox" style="background-color: ' + green2     + ';"></span>16~32' +
				'<span class="colorBox" style="background-color: ' + yellow1    + ';"></span>32~64' +
				'<span class="colorBox" style="background-color: ' + yellow2    + ';"></span>64~128' +
				'<span class="colorBox" style="background-color: ' + orange1    + ';"></span>128~256' +
				'<span class="colorBox" style="background-color: ' + orange2    + ';"></span>256~512' +
				'<span class="colorBox" style="background-color: ' + red1       + ';"></span>512~1024' +
				'<span class="colorBox" style="background-color: ' + red2       + ';"></span>1024~2048' +
				'<span class="colorBox" style="background-color: ' + purple1    + ';"></span>>2048');
            $('#color3').html('');
        }
	showDateMap(new Date(lastTime), cunli);
    });

    $('#map-population').on('click', function () 
    {
        if( $('input[name="map-type"]:checked').val() == 2 )
        {
            $('#color1').html('減少: <span class="colorBox" style="background-color: ' + green1  + ';"></span>0.1%~0.2%' +
				'<span class="colorBox" style="background-color: ' + green2      + ';"></span>0.2%~0.4%' +
				'<span class="colorBox" style="background-color: ' + blue1       + ';"></span>0.4%~0.8%' +
				'<span class="colorBox" style="background-color: ' + blue2       + ';"></span>>0.8%');
            $('#color2').html('持平: <span class="colorBox" style="background-color: ' + yellow1 + ';"></span>-4~+4人' +
				'<span class="colorBox" style="background-color: ' + yellow2     + ';"></span>-0.1%~+0.1%');
            $('#color3').html('增加: <span class="colorBox" style="background-color: ' + orange1 + ';"></span>0.1%~0.2%' +
				'<span class="colorBox" style="background-color: ' + orange2     + ';"></span>0.2%~0.4%' +
				'<span class="colorBox" style="background-color: ' + red1        + ';"></span>0.4%~0.8%' +
				'<span class="colorBox" style="background-color: ' + red2        + ';"></span>0.8%~1.6%' +
				'<span class="colorBox" style="background-color: ' + purple1     + ';"></span>>1.6%');
        }
        else if( $('input[name="map-type"]:checked').val() == 3 )
        {
            $('#color1').html('週數: <span class="colorBox" style="background-color: ' + purple1 + ';"></span>0'+
	    			'<span class="colorBox" style="background-color: ' + red4        + ';"></span>1' +
				'<span class="colorBox" style="background-color: ' + red3        + ';"></span>2' +
				'<span class="colorBox" style="background-color: ' + red2        + ';"></span>3' +
				'<span class="colorBox" style="background-color: ' + red1        + ';"></span>4' +
	    			'<span class="colorBox" style="background-color: ' + orange4     + ';"></span>5' +
				'<span class="colorBox" style="background-color: ' + orange3     + ';"></span>6' +
				'<span class="colorBox" style="background-color: ' + orange2     + ';"></span>7' +
				'<span class="colorBox" style="background-color: ' + orange1     + ';"></span>8');
	    $('#color2').html('<span class="colorBox" style="background-color:   ' + yellow4     + ';"></span>9' +
				'<span class="colorBox" style="background-color: ' + yellow3     + ';"></span>10' +
				'<span class="colorBox" style="background-color: ' + yellow2     + ';"></span>11' +
				'<span class="colorBox" style="background-color: ' + yellow1     + ';"></span>12' +
           			'<span class="colorBox" style="background-color: ' + green4      + ';"></span>13' +
				'<span class="colorBox" style="background-color: ' + green3      + ';"></span>14' +
				'<span class="colorBox" style="background-color: ' + green2      + ';"></span>15' +
				'<span class="colorBox" style="background-color: ' + green1      + ';"></span>16');
	    $('#color3').html('<span class="colorBox" style="background-color: '   + blue4       + ';"></span>17' +
				'<span class="colorBox" style="background-color: ' + blue3       + ';"></span>18' +
				'<span class="colorBox" style="background-color: ' + blue2       + ';"></span>19' +
				'<span class="colorBox" style="background-color: ' + blue1       + ';"></span>20' +
				'<span class="colorBox" style="background-color: ' + gray1       + ';"></span>>21');
        }
        else
        {
            $('#color1').html('人數: <span class="colorBox" style="background-color: white;"></span>0' +
				'<span class="colorBox" style="background-color: ' + blue1      + ';"></span>1人' +
				'<span class="colorBox" style="background-color: ' + blue2      + ';"></span>2~4人');
            $('#color2').html('密度: <span class="colorBox" style="background-color: ' + green1 + ';"></span><0.1%' +
				'<span class="colorBox" style="background-color: ' + green2     + ';"></span>0.1%-0.3%' +
				'<span class="colorBox" style="background-color: ' + yellow1    + ';"></span>0.3%~0.5%' +
				'<span class="colorBox" style="background-color: ' + yellow2    + ';"></span>0.5%~1%' +
				'<span class="colorBox" style="background-color: ' + orange1    + ';"></span>1%~2%' +
				'<span class="colorBox" style="background-color: ' + orange2    + ';"></span>2%~4%' +
				'<span class="colorBox" style="background-color: ' + red1       + ';"></span>4%~8%' +
				'<span class="colorBox" style="background-color: ' + red2       + ';"></span>8%~16%' +
				'<span class="colorBox" style="background-color: ' + purple1    + ';"></span>>16%');
            $('#color3').html('');
        }
        showDateMap(new Date(lastTime), cunli);
    });
}

function createStockChart(Cunli, cunli) {
    var series = [];
    var series7 = [];
    var series7change = [];
    var sum = 0;
    var sum2 = 0;

    for (var i = 0; i < DengueTW[Cunli].length; i++) {
	var recDate = new Date(DengueTW[Cunli][i][0]);
        var recTime = recDate.getTime();
        if( recDate.getMonth() > 5 )
        {
            series.push([recTime, DengueTW[Cunli][i][1]]);
// calculate a week
            sum += DengueTW[Cunli][i][1];
            if( i > 6 )
	    {
	        sum -= DengueTW[Cunli][i-7][1];
                sum2 += DengueTW[Cunli][i-7][1];
                if( i > 13 )
                {
                    sum2 -= DengueTW[Cunli][i-14][1];
                }
                series7change.push([recTime, parseInt((sum-sum2)/7*10)/10]);
            }
	    series7.push([recTime, parseInt(sum/7*10)/10]);
        }
    }

    Highcharts.setOptions({
        lang: {
            months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            loading: '載入中'
        }
    });

    $('#' + Cunli).highcharts('StockChart', {
        chart: {
            alignTicks: false,
            width: $('#myTabContent').width(),
            height: 250
        },
        rangeSelector: {
            enabled: false
        },
        tooltip: {
            enabled: true,
            positioner: function () {
                return {x: 10, y: 30}
            }
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            showDateMap(new Date(this.x), cunli);
                        }
                    }
                },
            }
        },
        series: [{
                type: 'column',
                name: Cunli,
                data: series,
            },{
               	type: 'line',
		linewidth: 1,
		color: '#CCCCCC',
        	name: '週平均',
	        data: series7
            },{
               	type: 'spline',
		linewidth: 1,
		color: 'pink',
        	name: '週變化',
	        data: series7change
            }]
    });
}

function showDateMap(clickedDate, cunli) {
    var yyyy = clickedDate.getFullYear().toString(),
            mm = (clickedDate.getMonth() + 1).toString(),
            dd = clickedDate.getDate().toString(),
            clickedDateKey = yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);

    lastTime = clickedDate.getTime();
    var time1 = lastTime - days7;
    var time2 = time1 - days7;

    cunli.forEach(function (value) {
        var key = value.getProperty('VILLAGE_ID'),
                count = 0;
	var count1=0, count2=0, spread=0;
	var selected = $('input[name="map-type"]:checked').val();
        value.setProperty('spread', 0);
	
        if (DengueTW[key]) {
            DengueTW[key].forEach(function (val) {
                if( selected == 1 )
                {
// 30 days
                    var diff = lastTime - new Date(val[0]).getTime();
                    if( diff < days30 && diff >= 0)
                    {
                        count += val[1];
                    }
                }
                else if( selected == 2 )
                {
// compare two weeks
                    var recordTime = new Date(val[0]).getTime();
                    if( recordTime > lastTime )
                    {
                    }
                    else if( recordTime > time1 )
                    {
                        count1 += val[1];
                    }
                    else if( recordTime > time2 )
                    {
                        count2 += val[1];
                    }
                }
                else if( selected == 3 )
                {
// spread
               	    var recordDate = new Date(val[0]);
                    
                    if( recordDate.getMonth() > 5 )
                    {
                        if (recordDate <= clickedDate)
                        {
                            if( $('input[name="map-div"]:checked').val() == 1 )
                            {
				var pop = value.getProperty('pop');
                                var count3 = count+val[1];
                                if( count < 5 || (count/pop) < 0.001 )
                                {
                                    if( count3 >= 5 && (count3/pop) >= 0.001 )
                                    {
                                        var spread = new Date(val[0]).getTime();
                                        value.setProperty('spread', spread);
                                        if( spreadTime == 0 )
                                        {
                                            spreadTime = spread;
                                        }
                                        else
                                        {
                                            if( spreadTime > spread )
                                            {
                                                spreadTime = spread;
                                            }
                                        }
                                    }
                                }
                            }
                            else
                            {
				var area = value.getProperty('area');
                                var count4 = count+val[1];
                                if( count < 5 || (count/area) < 16 )
                                {
                                    if( count4 >= 5 && (count4/area) >= 16 )
                                    {
                                        var spread = new Date(val[0]).getTime();
                                        value.setProperty('spread', spread);
                                        if( spreadTime == 0 )
                                        {
                                            spreadTime = spread;
                                        }
                                        else
                                        {
                                            if( spreadTime > spread )
                                            {
                                                spreadTime = spread;
                                            }
                                        }
                                    }
                                }
                            }
                            count += val[1];
                        }
                    }
                }
                else
                {
// all
                    var recordDate = new Date(val[0]);
  	            if( recordDate.getMonth() > 5 )
                    {
              	        if (recordDate <= clickedDate)
                        {
                            count += val[1];
                        }
                    }
                }
            });
        }

        if( selected == 2 )
        {
            value.setProperty('num', count1 - count2); 
            value.setProperty('sum', count1 + count2); 
        }
        else
        {
            value.setProperty('num', count);
        }
     });
    $('#title').html(clickedDateKey);
}

function showDayMap(clickedDate, cunli) {
    var yyyy = clickedDate.getFullYear().toString(),
            mm = (clickedDate.getMonth() + 1).toString(),
            dd = clickedDate.getDate().toString(),
            clickedDateKey = yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);

    $('#title').html(clickedDateKey + ' 當日病例');
    cunli.forEach(function (value) {
        var key = value.getProperty('VILLAGE_ID'),
                count = 0;

        if (DengueTW[key]) {
            DengueTW[key].forEach(function (val) {
                if (clickedDateKey == val[0]) {
                    count += val[1];
                }
            });
        }
        value.setProperty('num', count);
    });
}

$(window).resize(function () {
    var len = $('#myTabContent > .tab-pane').length;
    for (var i = 0; i < len; i++) {
        $('#myTabContent > .tab-pane').eq(i).highcharts().setSize($('#myTabContent').width(), 250);
    }
});

function closeTab(node) {
    var nodename = node.name;
    node.parentNode.remove();
    $('#' + nodename).remove();
    $('#myTab a:first').tab('show');
}

google.maps.event.addDomListener(window, 'load', initialize);
