var atts = 1;
var samples = 0;
var samplesp = 0;
var samplesn = 0;
var nset = [];
var pset = [];
var attz = [];

function score(h,pset,nset) {
	if (h.length==0) return 0;
	var p = 0;
	var n = samplesn;
	var c = 0;
	for (var i=0;i<samplesp;i++) {
		c = 0;
		for (var j=0;j<atts;j++) {
			if (pset[i][j] == h[j+1]) {
				c++;
			}
		}
		if (c>=h[0]) p++;
	}
	for (var i=0;i<samplesn;i++) {
		c = 0;
		for (var j=0;j<atts;j++) {
			if (nset[i][j] == h[j+1]) {
				c++;
			}
		}
		if (c>=h[0]) n--;
	}
	p = p + n;
	if (document.getElementById("score").value=="score1") p = p / samples;
	return p;
}

function hct(pset,nset,atts) {
	var temp = [];
	var hset = [];	
	var t = atts;
	var e = [];
	hset.push(t);
	for (var i=0;i<atts;i++) {
		for (var j=0;j<samplesp;j++) {
			temp.push(pset[j][i]);
		}
		e.push(mode(temp));
		hset.push(mode(temp));
		temp = [];
	}
	$("#process").append('<hr>PSET = {');
	for (var i=0;i<samplesp;i++) {
		$("#process").append("(" + pset[i] + ")");
	}
	$("#process").append('}</br>NSET = {');
	for (var i=0;i<samplesn;i++) {
		$("#process").append("(" + nset[i] + ")");
	}
	$("#process").append('}</br>ATTS = {' + attz + '}</br>E = {');
	for (var i=0;i<atts;i++) {
		$("#process").append(attz[0][i] + " = " + e[i]);
		if (i+1!=atts) $("#process").append(", ");
	}
	$("#process").append('}, T = ' + t + '</br>H = {' + hset[0] + '_of_');
	for (var i=0;i<atts;i++) {
		$("#process").append(attz[0][i] + " = " + hset[i+1]);
		if (i+1!=atts) $("#process").append(", ");
	}
	$("#process").append('} Score(H) = ' + score(hset,pset,nset));
	var h = [];
	h[0] = hset;
	hctaux(pset,nset,e,temp,h);
}

function op1 (h) {
	var arr = [];
	for (var i=0;i<h.length-1;i++) {
		arr[i] = JSON.parse(JSON.stringify(h));
		arr[i][h.length-i-1]=null;
		arr[i][0]--;
	}
	return arr;
}

function op2 (h) {
	var arr = [];
	var nn = findNull(h);
	var helper = [];
	for (var i=0;i<nset.length;i++) {
		helper.push(nset[i][nn-1]);
	}
	for (var i=0;i<pset.length;i++) {
		helper.push(pset[i][nn-1]);
	}
	helper = helper.filter(function(elem, pos) {
		return helper.indexOf(elem) == pos;
	}); 
	for (var i=0;i<helper.length;i++) {
		arr[i] = JSON.parse(JSON.stringify(h));
		arr[i][nn]=helper[i];
	}	
	return arr;
}

function findNull(h) {
	for (var i=1;i<h.length;i++) {
		if (h[i]==null) return i;
	}
	return 0;
}

function etalon (rr) {
	$("#process").append('{');
	for (var k=0;k<rr.length;k++) {
		$("#process").append('[' + rr[k][0] + '_of_');
		var o = 0;
		for (var l=0;l<atts;l++) {
			if (rr[k][l+1]!=null) {
				if (o!=0) $("#process").append(', ');
				$("#process").append(attz[0][l] + ' = ' + rr[k][l+1]);
				o++;
			}
		}
		$("#process").append(']');
	}
	$("#process").append('}');
}

function removeDuplicates(h) {
	for (var i=0;i<h.length;i++) {
		for (var j=i+1;j<h.length;j++) {
				if (h[i].toString() ==h[j].toString()) {
					h.shift();
				}
		}
	}
}

function scoreSort(a,b) {
	return score(b,pset,nset)-score(a,pset,nset);
}

function hctaux(pset,nset,e,cset,hset) {
	removeDuplicates(hset);
	var oset = [];
	$("#process").append('<hr>HSET = ');
	etalon(hset);
	$("#process").append('<br>');
	for (var i=0;i<hset.length;i++) {
		var specs = [];
		if (hset[i][0]<atts&&findNull(hset[i])>0) {
			specs = op2(hset[i]);
			$("#process").append('OP2 : SPECS = ');
			etalon(specs);
			$("#process").append('<br>');
		} else if (hset[i][0]>1) {
			specs = op1(hset[i]);
			$("#process").append('OP1 : SPECS = ');
			etalon(specs);
			$("#process").append('<br>');
		}
		var newset = [];
		for (var j=0;j<specs.length;j++) {
		$("#process").append('Score(S' + (j+1) + ') = ' + score(specs[j],pset,nset) + '<br>');
			if (score(specs[j],pset,nset)>score(hset[i],pset,nset)) {
				newset.push(specs[j]);
			}
		}
		if (newset.length==0) {
			cset.push(hset[i]);
		} else {
			for (var j=0;j<newset.length;j++) {
				oset.push(newset[j]);
			}
		}
	}
	removeDuplicates(oset);
	if (oset.length==0) {
		$("#result").empty().append('CLOSED SET = {');
		for (var i=0;i<cset.length;i++) {
			$("#result").append('[' + cset[i][0] + '_of_');
			var o = 0;
			for (var j=0;j<atts;j++) {
				if (cset[i][j+1]!=null) {
					if (o!=0) $("#result").append(', ');
					$("#result").append(attz[0][j] + ' = ' + cset[i][j+1]);
					o++;
				}
			}
			$("#result").append(']');
		}
		$("#result").append('}');
	} else {
		var beamsize = parseInt(document.getElementById("beam").value);
		if ((beamsize<cset.length+oset.length)&&beamsize!=0) {
			var noset = [];
			var ncset = [];
			var bset = oset.concat(cset);
			bset.sort(scoreSort);
			bset = bset.slice(0,beamsize);
			for (var i=0;i<bset.length;i++) {
				for (var j=0;j<cset.length;j++) {
					if (bset[i]==cset[j]) {
						ncset.push(bset[i]);
					}
				}
				for (var j=0;j<oset.length;j++) {
					if (bset[i]==oset[j]) {
						noset.push(bset[i]);
					}
				}
			}
			cset = ncset;
			oset = noset;
		}
		hctaux(pset,nset,e,cset,oset);
	}
}


function mode(array) {
    if(array.length == 0)
    	return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
    	var el = array[i];
    	if(modeMap[el] == null)
    		modeMap[el] = 1;
    	else
    		modeMap[el]++;
    	if(modeMap[el] > maxCount)
    	{
    		maxEl = el;
    		maxCount = modeMap[el];
    	}
    }
    return maxEl;
}

function getData() {
	$('#process').empty();
	attz = [];
	nset = [];
	pset = [];
	var q = 2;
	var p = 1;
    $('#tablep').find('tr').each(function (rowIndex, r) {
        var cols = [];
		q=2;
        $(this).find('th,td').each(function (colIndex, c) {
			if (q<=0) {
            cols.push(c.textContent);
			}
			q--;
        });
		if (p<=0) {
        pset.push(cols);
		} else {
		attz.push(cols);
		}
		p--;
    });
	q = 2;
	p = 1;
    $('#tablen').find('tr').each(function (rowIndex, r) {
        var cols = [];
		q=2;
        $(this).find('th,td').each(function (colIndex, c) {
			if (q<=0) {
            cols.push(c.textContent);
			}
			q--;
        });
		if (p<=0) {
        nset.push(cols);
		}
		p--;
    });
}

$(document).ready(function(){
	$( "#att" ).change(function() {
		if (parseInt(document.getElementById('att').value)>8) document.getElementById('att').value=8;
		if (parseInt(document.getElementById('att').value)<1) document.getElementById('att').value=1;
		var diff = parseInt(document.getElementById('att').value) - atts;
		atts = parseInt(document.getElementById('att').value);
		if (diff>0) {
			for (var i=0;i<diff;i++) {
				$('table').find('tr').each(function(){
					if ($(this).is(".firstcol")) {
						$(this).find('td').eq(atts-diff+i+1).after('<td>A' + (atts-diff+i+1) + '</td>');
					} else {
						$(this).find('td').eq(atts-diff+i+1).after('<td><div contenteditable></div></td>');
					}
				});
			}
		} else if (diff<0) {
			diff = Math.abs(diff);
			for (var i=0;i<diff;i++) {
				$('table').find('tr').each(function(){
					$(this).find('td').eq(atts+diff-i+1).remove();
				});
			}
		}
	});
	$( "#addp" ).click(function() {
		samples++;samplesp++;
		$('#tablep tr:last').after('<tr id="tr' + samples + '"><td class="remove" onclick="$(this).parent().remove();samples--;samplesp--;">-</td><td class="firstrow">' + samples + '.</td></tr>');
		for (var i=0;i<atts;i++) {
			$('#tablep tr:last').append("<td><div contenteditable></div></td>");
		}
	});
	$( "#addn" ).click(function() {
		samples++;samplesn++;
		$('#tablen tr:last').after('<tr id="tr' + samples + '"><td class="remove" onclick="$(this).parent().remove();samples--;samplesn--;">-</td><td class="firstrow">' + samples + '.</td></tr>');
		for (var i=0;i<atts;i++) {
			$('#tablen tr:last').append("<td><div contenteditable></div></td>");
		}
	});
	$( "#proc" ).change(function() {
		$( "#process" ).toggle();
	});
});