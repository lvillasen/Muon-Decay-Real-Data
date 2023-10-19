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
var veto;
var num_evts_file = 0;
var pre = document.createElement('pre');


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


var Ampl_mu = [];
var Ampl_e = [];
var Q_mu = [];
var Q_e = [];
var Delta_T = [];



function reset_real(){
    deltaTimeHisto = new Array(100).fill(0);
    N_noise = 0;
    n_evt_real = 0;
    n_evt_real_total = 0;
    
    Ampl_mu = [];
Ampl_e = [];
Q_mu = [];
Q_e = [];
Delta_T = [];
step_real();

}


function linear_regression(input_x, input_y){

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

//console.log('Slope:', m);
//console.log('Intercept:', b);
//console.log('Error on Slope:', delta_m);


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
    //console.log("Rate "+ parseInt(1000/rate))
    pre.textContent = data_all_events_real.split("\n")[n_evt_real].split(",")[0].split("S")[0]+"\nS"+data_all_events_real.split("\n")[n_evt_real].split(",")[0].split("S")[1];

    var divResultado = document.getElementById('resultado');
    divResultado.innerHTML = '';
    divResultado.appendChild(pre);
    Y_fitted = [];
n_evt_real ++;
n_evt_real_total ++;
//var Y_data =[];
var data_single_evt = data_all_events_real.split("\n")[n_evt_real];
var event_size = data_single_evt.split(",").length;
var head = data_single_evt.split(",")[0];
//console.log("head = "+head)
var num_equal = head.split("=").length;
//console.log("Num of equals ="+num_equal)

/*
deltaT_real = parseInt(head.split("=")[num_equal-1]);
//console.log("deltaT_real = "+deltaT_real)
if (deltaT_real > 8){
deltaTimeHisto[ Math.floor(deltaT_real/200)] += 1;
if (deltaT_real > 10000){ N_noise +=2}
*/

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
//console.log("head = "+head)
var num_equal = head.split("=").length;
//console.log("Num of equals ="+num_equal)
deltaT_real = parseInt(head.split("=")[num_equal-1]);
veto = head.split("=")[5];
veto = parseInt(veto.split(" ")[1]);
//if (veto<400) veto= 400;
//console.log("deltaT_real = "+deltaT_real)

//console.log("veto = "+veto)


for (var i = 2; i < event_size; i++) {
    Y_data.push(data_single_evt.split(",")[i]*1000);
}
var minima = findLocalMinima(Y_data,veto);
const ampl1 = -(minima[0]-minima[5]);
const ampl2 = -(minima[2]-minima[5]);
const Q1 = minima[6];
const Q2 = minima[7];
if (ampl1 > 10 && ampl2 > 10) {

X_data = [];
for (var i = 2; i < event_size; i++) {
    X_data.push((i-2)*8);
}
//if (deltaT_real > 500){
if( n_evt_real == num_evts_file-1){start_stop_real.value == "Start" }


//}


const deltaT_minima = minima[4];

if (deltaT_minima > veto){
deltaTimeHisto[ Math.floor(deltaT_minima/200)] += 1;
if (deltaT_minima > 10000){ N_noise +=2}

//deltaTimeHisto[ Math.floor(deltaT_real/200)] += 1;
//if (deltaT_real > 10000){ N_noise +=2}


//console.log("deltaT_minima = "+deltaT_minima)


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
            text:"Muon Decay Real Data <br> Delta Time: " + (deltaT_real/1000).toFixed(3) +" us "+ (deltaT_minima/1000).toFixed(3) +" us",
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
/////////////////////////////////////////////////////////////////////////////
var N_pos =0;
var y1 = deltaTimeHisto_back_sub[0]
while (y1 > 0){
    N_pos ++;
        y1 = deltaTimeHisto_back_sub[N_pos]
}




[m1,delta_m1,T_data1,Y_fitted,T_extrap,Y_extrap] = linear_regression(T_data,deltaTimeHisto)
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
/////////////////////////////////////////////////////////////////////////////
//console.log("Minima amplitudes: "+minima)

Ampl_mu.push(ampl1);

Ampl_e.push(ampl2);
Q_mu.push(Q1);
Q_e.push(Q2);

var trace_mu = {
    x: Ampl_mu,
    type: 'histogram',
    opacity: 0.5,
    name: 'First Pulse',
  marker: {
     color: 'blue',
  },
  };
var trace_e = {
    x: Ampl_e,
    type: 'histogram',
    opacity: 0.5,
    name: 'Second Pulse',
  marker: {
     color: 'red',
  },
  };

var trace_q_mu = {
    x: Q_mu,
    type: 'histogram',
    opacity: 0.5,
    name: 'First Pulse',
  marker: {
     color: 'blue',
  },
  };
var trace_q_e = {
    x: Q_e,
    type: 'histogram',
    opacity: 0.5,
    name: 'Second Pulse',
  marker: {
     color: 'red',
  },
  };
var data_Ampl_mu = [trace_mu];
var data_Ampl_e = [trace_e];
var data_q_mu = [trace_q_mu];
var data_q_e = [trace_q_e];
var layout3 = {
          xaxis: {
               //  range: [0, 500],
              title: "Amplitude (mV)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Amplitude Distribution of First Pulse" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };

var layout3q = {
          xaxis: {
               //  range: [0, 500],
              title: "Charge (pC)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Charge Distribution of First Pulse" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };

var layout4 = {
          xaxis: {
               //  range: [0, 300],
              title: "Amplitude (mV)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Amplitude Distribution of Second Pulse" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };

var layout4q = {
          xaxis: {
               //  range: [0, 300],
              title: "Charge (pC)"
          },
          yaxis: {
                 //range: [0, -150],
              title: "Events"
          },
          title: {
            text:"Muon Decay Real Data " +n_evt_real_total+" Events <br> Charge Distribution of Second Pulse" ,

font: {
      family: 'Times New Roman',
      size: 24
    },
}

      };
Plotly.newPlot('plot_amplitude_mu', data_Ampl_mu,layout3);
Plotly.newPlot('plot_q_mu', data_q_mu,layout3q);
/////////////////////////////////////////////////////////////////////////////
Plotly.newPlot('plot_amplitude_e', data_Ampl_e,layout4);
Plotly.newPlot('plot_q_e', data_q_e,layout4q);
/////////////////////////////////////////////////////////////////////////////


Delta_T.push(deltaT_minima);

/////////////////////


var DeltaT_mu = {
  x: Delta_T,
  y: Ampl_mu,
  mode: 'markers',
  type: 'scatter',
  name: 'First Pulse',
  marker: { size: 6 }
};

var DeltaT_e = {
  x: Delta_T,
  y: Ampl_e,
  mode: 'markers',
  type: 'scatter',
  name: 'Second Pulse',
  marker: { size: 6 }
};

var data_DT_A = [ DeltaT_mu, DeltaT_e ];

var layout_DT_A = {
 xaxis: {
                 //range: [-100, 20000],
              title: "Time (ns)"
          },
yaxis: {
                 //range: [0, -150],
              title: "Amplitude (mV)"
          },
  title:'Amplitudes vs Time'
};

Plotly.newPlot('plot_scatter_DT_A', data_DT_A, layout_DT_A);
/////////////////////////////////////////////////////////////////////////////



var trace_3D = {
    x:Delta_T, y: Ampl_mu, z:Ampl_e,
    mode: 'markers',
    marker: {
        size: 4,
        line: {
        color: 'blue',
        width: 0.1},
        opacity: 0.8},
    type: 'scatter3d'
};
var data_DT_A_3D = [ trace_3D ];
var layout_DT_A_3D = {
    scene:{
 xaxis: {
    title: 'Time (ns)',
     backgroundcolor: "rgb(200, 200, 230)",
     gridcolor: "rgb(255, 255, 255)",
     showbackground: true,
     zerolinecolor: "rgb(255, 255, 255)",
    },
    yaxis: {
        title: '1st Pulse (mV)',
     backgroundcolor: "rgb(230, 200,230)",
     gridcolor: "rgb(255, 255, 255)",
     showbackground: true,
     zerolinecolor: "rgb(255, 255, 255)"
    },
    zaxis: {
        title: '2nd Pulse (mV)',
     backgroundcolor: "rgb(230, 230,200)",
     gridcolor: "rgb(255, 255, 255)",
     showbackground: true,
     zerolinecolor: "rgb(255, 255, 255)"
    }},
  title:'Amplitudes vs Time'
};

Plotly.newPlot('plot_scatter_DT_A_3D', data_DT_A_3D, layout_DT_A_3D);
/////////////////////////////////////////////////////////////////////////////

}
}
}

function start_real(){
     //n_evt_real = 0;
 var select = document.getElementById('file');
            var file_selected = select.value;
            //console.log("file_selected: "+file_selected)
            pre.textContent = "Reading data file ......";
            //console.log( "Reading data file ......");


            if (file_selected) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        data_all_events_real = xhr.responseText;
            num_evts_file =  data_all_events_real.split("\n").length;
                        //console.log("num_evts_file ="+num_evts_file);
                        step_real();
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
      //step_real();
  }
}


///////////////////////////////////////////////////////////
function findLocalMinima(arr,veto) {

// const veto = 500/8;
var Amin1 =10;
var Amin2 =10;
var Amin1_index =-1;
var Amin2_index =-1;

var baseline1 = 0
var baseline2 = 0
const N_baseline = 10;
for(let i = 1; i < N_baseline+1; i++)
    {
    baseline1 += arr[i]
}
baseline1 = baseline1/N_baseline;

for(let i = arr.length-N_baseline-1; i < arr.length-1; i++)
    {
    baseline2 += arr[i]
}
baseline2 = baseline2/N_baseline;
const baseline = Math.max(baseline1,baseline2);



    for(let i = 0; i < arr.length - 1; i++)
    {
 if (arr[i]<Amin1) { Amin1 = arr[i];
 Amin1_index = i;
}
}

for(let i = 0; i < arr.length - 1; i++)
    {
 if (Math.abs(i-Amin1_index) > veto/8 && arr[i]<Amin2) { Amin2 = arr[i];
 Amin2_index = i;
}
}
///////////// calculation of charge
var Q1_left = 0;
var i_q1_l = Amin1_index;
while (Math.abs(arr[i_q1_l]-baseline ) > 1){
    Q1_left += Math.abs(arr[i_q1_l]-baseline )*8 ;
    i_q1_l += -1;
}
var Q1_right = 0;
var i_q1_r = Amin1_index+1;
while (Math.abs(arr[i_q1_r]-baseline ) > 1){
    Q1_right += Math.abs(arr[i_q1_r]-baseline )*8 ;
    i_q1_r += 1;
}

var Q2_left = 0;
var i_q2_l = Amin2_index;
while (Math.abs(arr[i_q2_l]-baseline ) > 1){
    Q2_left += Math.abs(arr[i_q2_l]-baseline )*8 ;
    i_q2_l += -1;
}
var Q2_right = 0;
var i_q2_r = Amin2_index+1;
while (Math.abs(arr[i_q2_r]-baseline ) > 1){
    Q2_right += Math.abs(arr[i_q2_r]-baseline )*8 ;
    i_q2_r += 1;
}

var Q1 = (Q1_left+Q1_right)/50;
var Q2 = (Q2_left+Q2_right)/50;
Q1 = Q1.toFixed(1);
Q2 = Q2.toFixed(1);
if (Q1 > 800){Q1=800};
if (Q2 > 500){Q2=500};



if (Amin1_index<Amin2_index)
    return [Amin1,Amin1_index,Amin2,Amin2_index,8*(Amin2_index-Amin1_index),baseline,Q1,Q2];
else
return [Amin2,Amin2_index,Amin1,Amin1_index,8*(Amin1_index-Amin2_index),baseline,Q2,Q1];
}
