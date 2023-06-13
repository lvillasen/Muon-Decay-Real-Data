var start_stop = document.getElementById("start_stop");
var start_stop_real = document.getElementById("start_stop_real");
var my_count;
var amplitude1;
var amplitude2;
var lifetime = 2000; //  ns
var tau_pulse = 100; //  ns
var deltaT;
var deltaTime = [];
var deltaTimeHisto = new Array(100).fill(0);
var deltaTimeHisto_back_sub = new Array(100).fill(0);

var deltaTimeHistoLog = new Array(100).fill(0);
var deltaTimeHistoLog_back_sub = new Array(100).fill(0);
var Y_histogram =[];
var m; var b; var sigma_m;
var m1; var delta_m1;
var fit_type = 0;

var N_evts = 0;
var N_noise = 0;
var T_data = [];
var T_data1 = [];
var Y_fitted = [];
var T_dataHalf = [];
var T_extrap = [];
var Y_extrap = [];
var event_real = [];
var data_all_events_real ="";
var n_evt_real = 0;
var n_evt_real_total = 0;
var deltaT_real;
var num_evts_file = 0;

for (var i =0;i<20000;i=i+200){
    T_data.push(i);
}

for (var i =0;i<10000;i=i+200){
    T_dataHalf.push(i);
}

var X_data = [];
for (var i = 0; i < 21000; i=i+8) {
    X_data.push(i);
}

var my_element = document.getElementById("my_element");
my_element.scrollIntoView({
  behavior: "smooth",
  block: "start",
  inline: "nearest"
});




function reset_real(){
    deltaTimeHisto = new Array(100).fill(0);
    N_noise = 0;
    n_evt_real = 0;
    n_evt_real_total = 0;
    step_real();

}

function linear_regression(input_x, input_y) {
    var first_bin_to_fit = parseInt(document.getElementById("bin").value)-1;
    var N_pos =first_bin_to_fit;
    var y1 = input_y[N_pos]
    while (y1 > N_noise/100){
        N_pos ++;
        y1 = input_y[N_pos]
    }

    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;

    var x = 0;
    var y = 0;
    var y1 = 0;

    var N_points = N_pos - first_bin_to_fit;
    for (let i = first_bin_to_fit; i< N_pos; i++) {
        x = input_x[i];
        y = Math.log(input_y[i]- N_noise/100) ;
        x_sum+= x;
        y_sum+= y;
        xx_sum += x*x;
        xy_sum += x*y;
    }

    var m = (N_points*xy_sum - x_sum*y_sum) / (N_points*xx_sum - x_sum*x_sum);
    var b = (y_sum - m*x_sum)/N_points;
var s2y = 0;
var s2x = 0;
for (let i = first_bin_to_fit; i< N_pos; i++) {
        x = input_x[i];
        y = Math.log(input_y[i]- N_noise/100) ;
        s2y +=  Math.pow((y - y_sum/N_points),2);
        s2x +=  Math.pow((x - x_sum/N_points),2);
    }


    var delta_m = Math.sqrt(s2y/(N_points-2)/s2x);
console.log ("Slope = "+m)
console.log (delta_m/m)
    var results_x = [];
    var results_y = [];

    var extrapolated_x = [];
    var extrapolated_y = [];
// Data_Noise_Subtracted = Data - Noise
// Data_Noise_Subtracted_Linear = log (Data_Noise_Subtracted)
    for (let i = first_bin_to_fit; i < N_pos; i++) {
        x = input_x[i];
        if (fit_type == 0){ // Data_Noise_Subtracted_Linear
           y = x * m + b;
       } else if (fit_type == 1){ // Data_Noise_Subtracted_Linear

         y =  Math.log(Math.exp(x * m + b)+N_noise/100);
       }else if (fit_type == 2){

         y = Math.exp(x * m + b);
       }else if (fit_type == 3){

         y = Math.exp(x * m + b)+N_noise/100;
       }

        results_x.push(x);
        results_y.push(y);
    }

    for (let i = N_pos; i < 100; i++) {
        x = input_x[i];
        if (fit_type == 0){ // Data_Noise_Subtracted_Linear
           y = x * m + b;
       } else if (fit_type == 1){ // Data_Noise_Subtracted_Linear

         y =  Math.log(Math.exp(x * m + b)+N_noise/100);
       }else if (fit_type == 2){

         y = Math.exp(x * m + b);
       }else if (fit_type == 3){

         y = Math.exp(x * m + b)+N_noise/100;
       }

        extrapolated_x.push(x);
        extrapolated_y.push(y);
    }

    return [m,delta_m,results_x, results_y,extrapolated_x,extrapolated_y];
}

function linear_regression2(input_x, input_y){

var first_bin_to_fit = parseInt(document.getElementById("bin").value)-1;
var N_pos =first_bin_to_fit;
var y1 = input_y[N_pos]
while (y1 > N_noise/100){
    N_pos ++;
    y1 = input_y[N_pos]
}
var x = [];
var y = [];
var weights = [];

for (let i = first_bin_to_fit; i< N_pos; i++) {
        x.push(input_x[i]);
        y.push(Math.log(input_y[i]- N_noise/100)) ;
        weights.push(input_y[i]- N_noise/100)
    }




// Sample data
//const x = [1, 2, 3, 4, 5]; // Independent variable
//const y = [2, 4, 6, 8, 10]; // Dependent variable
//const weights = [1, 1, 1, 1, 1]; // Weights for each data point

// Calculate weighted linear regression
const n = x.length;
let sumX = 0;
let sumY = 0;
let sumWX = 0;
let sumWY = 0;
let sumW = 0;
let sumWXX = 0;
let sumWXY = 0;

for (let i = 0; i < n; i++) {
  const weight = weights[i];
  sumX += x[i] * weight;
  sumY += y[i] * weight;
  sumWX += x[i] * weight * x[i];
  sumWY += x[i] * weight * y[i];
  sumW += weight;
}

const meanX = sumX / sumW;
const meanY = sumY / sumW;
const covXY = (sumWY - meanX * sumY) / sumW;
const varX = (sumWX - meanX * sumX) / sumW;

const m = covXY / varX;
const b = meanY - m * meanX;

// Calculate error on the slope
let sumSquaredResiduals = 0;
let sumSquaredWeights = 0;

for (let i = 0; i < n; i++) {
  const predicted = m * x[i] + b;
  const residual = y[i] - predicted;
  const squaredWeight = weights[i] * weights[i];
  
  sumSquaredResiduals += squaredWeight * residual * residual;
  sumSquaredWeights += squaredWeight;
}

const delta_m = Math.sqrt(sumSquaredResiduals / ((n - 2) * varX * sumSquaredWeights));

console.log('Slope:', m);
console.log('Intercept:', b);
console.log('Error on Slope:', delta_m);


var results_x = [];
    var results_y = [];
    var x1;
    var y1;

    var extrapolated_x = [];
    var extrapolated_y = [];
// Data_Noise_Subtracted = Data - Noise
// Data_Noise_Subtracted_Linear = log (Data_Noise_Subtracted)
    for (let i = first_bin_to_fit; i < N_pos; i++) {
        x1 = input_x[i];
        if (fit_type == 0){ // Data_Noise_Subtracted_Linear
           y1 = x1 * m + b;
       } else if (fit_type == 1){ // Data_Noise_Subtracted_Linear

         y1 =  Math.log(Math.exp(x1 * m + b)+N_noise/100);
       }else if (fit_type == 2){

         y1 = Math.exp(x1 * m + b);
       }else if (fit_type == 3){

         y1 = Math.exp(x1 * m + b)+N_noise/100;
       }

        results_x.push(x1);
        results_y.push(y1);
    }

    for (let i = N_pos; i < 100; i++) {
        x1 = input_x[i];
        if (fit_type == 0){ // Data_Noise_Subtracted_Linear
           y1 = x1 * m + b;
       } else if (fit_type == 1){ // Data_Noise_Subtracted_Linear

         y1 =  Math.log(Math.exp(x1 * m + b)+N_noise/100);
       }else if (fit_type == 2){

         y1 = Math.exp(x1 * m + b);
       }else if (fit_type == 3){

         y1 = Math.exp(x1 * m + b)+N_noise/100;
       }

        extrapolated_x.push(x1);
        extrapolated_y.push(y1);
    }

    return [m,delta_m,results_x, results_y,extrapolated_x,extrapolated_y];



//return [slope,errorOnSlope,results_x, results_y,extrapolated_x,extrapolated_y];
}

function step_real(){
    //console.log("data for all evt ="+data_all_events_real);
    var rate = parseInt(document.getElementById('rate').value);
    console.log("Rate "+ parseInt(1000/rate))
    var pre = document.createElement('pre');
    pre.textContent = data_all_events_real.split("\n")[n_evt_real].split(",")[0].split("S")[0]+"\nS"+data_all_events_real.split("\n")[n_evt_real].split(",")[0].split("S")[1];

    var divResultado = document.getElementById('resultado');
    divResultado.innerHTML = '';
    divResultado.appendChild(pre);
    Y_fitted = [];
n_evt_real ++;
n_evt_real_total ++;
var Y_data =[];
var data_single_evt = data_all_events_real.split("\n")[n_evt_real];
var event_size = data_single_evt.split(",").length;
var head = data_single_evt.split(",")[0];
console.log("head = "+head)
var num_equal = head.split("=").length;
console.log("Num of equals ="+num_equal)
deltaT_real = parseInt(head.split("=")[num_equal-1]);
console.log("deltaT_real = "+deltaT_real)
deltaTimeHisto[ Math.floor(deltaT_real/200)] += 1;
if (deltaT_real > 10000){ N_noise +=2}

    draw_real();
    //n_evt_real ++;
if(start_stop_real.value == "Stop" ){
setTimeout(function(){
if( n_evt_real == num_evts_file-2){start_stop_real.value = "Start" }
        requestAnimationFrame(step_real)
    }, parseInt(1000/rate));


}
}

function draw_real(){

//console.log("data for evt ="+data_all_events_real.split("\n")[n_evt_real]);
var Y_data =[];
var data_single_evt = data_all_events_real.split("\n")[n_evt_real];
var event_size = data_single_evt.split(",").length;
var head = data_single_evt.split(",")[0];
console.log("head = "+head)
var num_equal = head.split("=").length;
console.log("Num of equals ="+num_equal)
deltaT_real = parseInt(head.split("=")[num_equal-1]);
console.log("deltaT_real = "+deltaT_real)
//deltaTimeHisto[ Math.floor(deltaT_real/200)] += 1;
//if (deltaT_real > 10000){ N_noise +=2}

for (var i = 2; i < event_size; i++) {
    Y_data.push(data_single_evt.split(",")[i]*1000);
}
//console.log("Datos reales="+n_evt_real +" " +data_single_evt)
//console.log("Datos reales="+Y_data)
//console.log("Event size = "+event_size)



X_data = [];
for (var i = 2; i < event_size; i++) {
    X_data.push((i-2)*8);
}
//if (deltaT_real > 500){
if( n_evt_real == num_evts_file-1){start_stop_real.value == "Start" }


//}

for (var i = 0; i < 100; i++) {
    deltaTimeHisto_back_sub[i] = deltaTimeHisto[i]- N_noise/100;
    deltaTimeHistoLog[i] = Math.log(deltaTimeHisto[i]);
    deltaTimeHistoLog_back_sub[i] = Math.log(deltaTimeHisto[i]- N_noise/100);
}



if (document.getElementById("logscale").checked == true) {
    if (document.getElementById("back_subtracted").checked == true) {
        fit_type = 0;
        Y_histogram = deltaTimeHistoLog_back_sub;
        Y_fitted = [];
        for (var i =0*200;i<20000;i=i+200){
            Y_fitted.push(b+m*i);
        }
        var trace_noise = {};
    }
}

if (document.getElementById("logscale").checked == true) {
    if (document.getElementById("back_subtracted").checked == false) {
        fit_type = 1;
        Y_histogram = deltaTimeHistoLog;
        Y_fitted = [];
        for (var i =0*200;i<20000;i=i+200){
            Y_fitted.push(Math.log(Math.exp(b+m*i) +N_noise/100));
        }
    }
    var trace_noise = {
    x: [0,20000],
    y: [Math.log(N_noise/100),Math.log(N_noise/100)],
    mode: 'lines',
    type: 'line',
    name: 'Log(Background Noise Events / 200 ns)',
    line:{
            color: 'green',
            width: 2,
            dash:'dot'
        }
  };
}
if (document.getElementById("logscale").checked == false) {
    if (document.getElementById("back_subtracted").checked == true) {
    fit_type = 2;
        Y_histogram = deltaTimeHisto_back_sub;
        Y_fitted = [];
        for (var i =0*200;i<20000;i=i+200){
            Y_fitted.push(Math.exp(b+m*i));
            }

    }
}
if (document.getElementById("logscale").checked == false) {
    if (document.getElementById("back_subtracted").checked == false) {
        fit_type = 3;
        Y_fitted = [];
                for (var i =0*200;i<20000;i=i+200){
            Y_fitted.push(Math.exp(b+m*i)+N_noise/100);
        }
        Y_histogram = deltaTimeHisto;

        var trace_noise = {
    x: [0,20000],
    y: [N_noise/100,N_noise/100],
    mode: 'lines',
    type: 'line',
    name: 'Background Noise Events / 200 ns',

    line:{
            color: 'green',
            width: 2,
            dash:'dot'
        }
  };
    }
}




      var layout = {
          xaxis: {
              //   range: [0, N],
              title: "Time (ns)"
          },
          yaxis: {
                 range: [-500, 0],
              title: "Amplitude (mV)"
          },
          title: {
            text:"Muon Decay Real Data <br> Delta Time: " + (deltaT_real/1000).toFixed(3) +" us",
          font: {
      family: 'Times New Roman',
      size: 24
    },
}
      };
      var data = [{
          x: X_data,
          y: Y_data,
          mode: "lines+markers",
          type: 'line',
            marker: {
    color: 'rgb(158,202,225)',
    opacity: 0.6,
    line: {
      color: 'rgb(8,48,107)',
      width: 1.
    }
  }


      }];

Plotly.newPlot("plot1", data, layout);
var N_pos =0;
var y1 = deltaTimeHisto_back_sub[0]
while (y1 > 0){
    N_pos ++;
        y1 = deltaTimeHisto_back_sub[N_pos]
}




[m1,delta_m1,T_data1,Y_fitted,T_extrap,Y_extrap] = linear_regression2(T_data,deltaTimeHisto)
var trace2 = {
    x: T_data,
    y: Y_histogram,
    type: 'bar',
    name: 'Data',
marker: {
    color: 'rgb(158,202,225)',
    opacity: 0.6,
    line: {
      color: 'rgb(8,48,107)',
      width: 1.5
    }
  }

  };

var trace_fit = {
    x: T_data1,
    y: Y_fitted,
    mode: 'lines',
    type: 'line',
    name: 'Fitted Curve',
    line:{
            color: 'black',
            width: 2,
            dash:'solid'
        }
  };




var trace_fit_extrap = {
    x: T_extrap,
    y: Y_extrap,
    mode: 'lines',
    type: 'line',
    name: 'Extrapolation of Fitted Curve',
    line:{
            color: 'blue',
            width: 2,
            dash:'dot'
        }
  };
if (m1 > 0){
    var data2 = [trace2];
}else  if  (document.getElementById("back_subtracted").checked == true) {
    var data2 = [trace2, trace_fit,trace_fit_extrap];
}else { var data2 = [trace2, trace_fit,trace_fit_extrap,trace_noise]; }
//}

if (m1<0){
var layout2 = {
          xaxis: {
                 range: [-100, 20000],
              title: "Time (ns)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events/200 ns"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Measured Background Noise "+N_noise +" Events <br> Measured Lifetime " +(-1/m1/1000).toFixed(3) +" +- "+ (delta_m1/m1**2/1000).toFixed(3)+ " us" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };
  }else{
var layout2 = {
          xaxis: {
                 range: [-100, 20000],
              title: "Time (ns)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events/200 ns"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Measured Background Noise "+N_noise +" Events" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };
  }

Plotly.newPlot("plot2", data2,layout2);
}

function start_real(){
     n_evt_real = 0;
 var select = document.getElementById('file');
            var file_selected = select.value;
            console.log("file_selected: "+file_selected)


            if (file_selected) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        data_all_events_real = xhr.responseText;
			num_evts_file =  data_all_events_real.split("\n").length;
                        console.log("num_evts_file ="+num_evts_file);
                        /*
                        var pre = document.createElement('pre');
                        pre.textContent = "Holaaaa.."+data_all_events_real.split("\n")[0];

                        var divResultado = document.getElementById('resultado');
                        divResultado.innerHTML = '';
                        divResultado.appendChild(pre);
                        */
                        step_real()
                    } else if (xhr.readyState === 4 && xhr.status !== 200) {
                        var divResultado = document.getElementById('resultado');
                        divResultado.innerHTML = 'Error in accessing the file.';
                    }
                };

                xhr.open('GET', file_selected, true);
                xhr.send();

            }


if(start_stop_real.value == "Stop"){
      start_stop_real.value = "Start";
}
else if (start_stop_real.value == "Start"){
      start_stop_real.value = "Stop";
      step_real();}
}