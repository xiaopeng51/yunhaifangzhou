            function watermark(t1,t2,t3){
                var maxWidth = document.documentElement.clientWidth;
                var maxHeight = document.documentElement.clientHeight;
                var intervalWidth = 320;    //闂撮殧瀹藉害
                var intervalheight = 180;   //闂撮殧楂樺害
                var rowNumber = (maxWidth - 40 -200) / intervalWidth;    //妯悜涓暟
                var coumnNumber = (maxHeight - 40-80) / intervalheight;   //绾靛悜涓暟

                //榛樿璁剧疆
                var defaultSettings = {
                    watermark_color: '#aaa', //姘村嵃瀛椾綋棰滆壊
                    watermark_alpha: 0.40, //姘村嵃閫忔槑搴�
                    watermark_fontsize: '15px', //姘村嵃瀛椾綋澶у皬
                    watermark_font: '寰蒋闆呴粦', //姘村嵃瀛椾綋
                    watermark_width: 200, //姘村嵃瀹藉害
                    watermark_height: 80, //姘村嵃闀垮害
                    watermark_angle: 15 //姘村嵃鍊炬枩搴︽暟
                };

                var _temp = document.createDocumentFragment();
                for(var i = 0; i < rowNumber; i++){
                    for(var j = 0; j < coumnNumber; j++){
                        var x = intervalWidth*i + 20;
                        var y = intervalheight*j + 30;
                        var mark_div = document.createElement('div');
                        mark_div.id = 'mark_div' + i + j;
                        mark_div.className = 'mark_div';
                        ///涓変釜鑺傜偣
                        var span0 = document.createElement('div');
                        span0.appendChild(document.createTextNode(t1));
                        var span1 = document.createElement('div');
                        span1.appendChild(document.createTextNode(t2));
                        var span2 = document.createElement('div');
                        span2.appendChild(document.createTextNode(t3));
                        mark_div.appendChild(span0);
                        mark_div.appendChild(span1);
                        mark_div.appendChild(span2);
                        //璁剧疆姘村嵃div鍊炬枩鏄剧ず
                        mark_div.style.webkitTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                        mark_div.style.MozTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                        mark_div.style.msTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                        mark_div.style.OTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                        mark_div.style.transform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                        mark_div.style.visibility = "";
                        mark_div.style.position = "absolute";
                        mark_div.style.left = x + 'px';
                        mark_div.style.top = y + 'px';
                        mark_div.style.overflow = "hidden";
                        mark_div.style.zIndex = "9999";
                        mark_div.style.pointerEvents = 'none'; //pointer-events:none  璁╂按鍗颁笉闃绘浜や簰浜嬩欢
                        mark_div.style.opacity = defaultSettings.watermark_alpha;
                        mark_div.style.fontSize = defaultSettings.watermark_fontsize;
                        mark_div.style.fontFamily = defaultSettings.watermark_font;
                        mark_div.style.color = defaultSettings.watermark_color;
                        mark_div.style.textAlign = "center";
                        mark_div.style.width = defaultSettings.watermark_width + 'px';
                        mark_div.style.height = defaultSettings.watermark_height + 'px';
                        mark_div.style.display = "block";

                        _temp.appendChild(mark_div);
                    }
                }
                document.body.appendChild(_temp);
            }

          