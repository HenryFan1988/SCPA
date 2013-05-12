function Abs(x) { return Math.abs(x) }
function Sqrt(x) { return Math.sqrt(x) }
function Exp(x) { return Math.exp(x) }
function Ln(x) { return Math.log(x) }
function Power(x, n) { return Math.pow(x, n) }

var Pi = 3.141592653589793;
var PiD2 = Pi / 2;

function ChiSq(x, n) {
    if (x > 1000 | n > 1000) { var q = Norm((Power(x / n, 1 / 3) + 2 / (9 * n) - 1) / Sqrt(2 / (9 * n))) / 2; if (x > n) { return q } else { return 1 - q } }
    var p = Math.exp(-0.5 * x); if ((n % 2) == 1) { p = p * Math.sqrt(2 * x / Pi) }
    var k = n; while (k >= 2) { p = p * x / k; k = k - 2 }
    var t = p; var a = n; while (t > 1e-15 * p) { a = a + 2; t = t * x / a; p = p + t }
    return 1 - p
}

function Norm(z) {
    var q = z * z
    if (Abs(z) > 7) { return (1 - 1 / q + 3 / (q * q)) * Exp(-q / 2) / (Abs(z) * Sqrt(PiD2)) } else { return ChiSq(q, 1) }
}

function Fmt(x) {
    var v;
    if (x >= 0) { v = '          ' + (x + 0.00005) } else { v = '          ' + (x - 0.00005) }
    v = v.substring(0, v.indexOf('.') + 5)
    return v.substring(v.length - 10, v.length)
}

function Fmt3(x) {
    var v;
    v = "   " + x;
    return v.substring(v.length - 3, v.length)
}

function Fmt9(x) {
    var v;
    v = "         " + x;
    return v.substring(v.length - 9, v.length)
}

function vFmt(x) {
    var v;
    if (x >= 0) { v = '              ' + (x + 0.0000005) } else { v = '          ' + (x - 0.0000005) }
    v = v.substring(0, v.indexOf('.') + 7)
    return v.substring(v.length - 14, v.length)
}

function Xlate(s, from, to) {
    var v = s;
    var l = v.indexOf(from);
    while (l > -1) {
        v = v.substring(0, l) + to + v.substring(l + 1, v.length);
        l = v.indexOf(from)
    }
    return v
}

function crArr(n) {
    this.length = n
    for (var i = 0; i < this.length; i++) { this[i] = 0 }
}

function ix(j, k, nCols) { return j * nCols + k }

function convertToMatrix(data) {
    var temp = [];
    $.each(data, function (index, value) {
        temp.push(value.join(','));
    });
    return temp.join(unescape("%0A"));
}

var CR = unescape("%0D");
var LF = unescape("%0A");
var Tb = unescape("%09");
var NL = CR + LF;

function predict(data) {

    var i = 0; var j = 0; var k = 0; var l = 0;

    var cPts = data.length;

    var cVar = data[0].length - 1;

    var value = convertToMatrix(data);

    var output = [];

    var nC = cPts;
    var nR = cVar;
    var nP = nR + 1;
    var nP1 = nP + 1;
    var sY0 = 0;
    var sY1 = 0;
    var sC = 0;

    var X = new crArr(nC * (nR + 1));
    var Y0 = new crArr(nC);
    var Y1 = new crArr(nC);
    var xM = new crArr(nR + 1);
    var xSD = new crArr(nR + 1);
    var Par = new crArr(nP);
    var SEP = new crArr(nP);
    var Arr = new crArr(nP * nP1);

    var da = Xlate(value, Tb, ",");

    if (da.indexOf(NL) == -1) { if (da.indexOf(CR) > -1) { NL = CR } else { NL = LF } }

    for (i = 0; i < nC; i++) {
        X[ix(i, 0, nR + 1)] = 1;
        l = da.indexOf(NL); if (l == -1) { l = da.length };
        var v = da.substring(0, l);
        da = da.substring(l + NL.length, da.length);
        for (j = 1; j <= nR; j++) {
            l = v.indexOf(","); if (l == -1) { l = v.length };
            x = eval(v.substring(0, l))

            X[ix(i, j, nR + 1)] = x;
            v = v.substring(l + 1, v.length);
        }

        x = eval(v.substring(0, l));
        if (x == 0) { Y0[i] = 1; sY0 = sY0 + 1 } else { Y1[i] = 1; sY1 = sY1 + 1 }
        sC = sC + (Y0[i] + Y1[i]);
        for (j = 1; j <= nR; j++) {
            x = X[ix(i, j, nR + 1)];
            xM[j] = xM[j] + (Y0[i] + Y1[i]) * x;
            xSD[j] = xSD[j] + (Y0[i] + Y1[i]) * x * x;
        }
    }

    xM[0] = 0; xSD[0] = 1;

    for (i = 0; i < nC; i++) {
        for (j = 1; j <= nR; j++) {
            X[ix(i, j, nR + 1)] = (X[ix(i, j, nR + 1)] - xM[j]) / xSD[j];
        }
    }


    Par[0] = Ln(sY1 / sY0);
    for (j = 1; j <= nR; j++) {
        Par[j] = 0;
    }

    var LnV = 0; var Ln1mV = 0;

    var LLp = 2e+10;
    var LL = 1e+10;

    while (Abs(LLp - LL) > 0.0000001) {
        LLp = LL;
        LL = 0;
        for (j = 0; j <= nR; j++) {
            for (k = j; k <= nR + 1; k++) {
                Arr[ix(j, k, nR + 2)] = 0;
            }
        }

        for (i = 0; i < nC; i++) {
            var v = Par[0];
            for (j = 1; j <= nR; j++) {
                v = v + Par[j] * X[ix(i, j, nR + 1)];
            }
            if (v > 15) { LnV = -Exp(-v); Ln1mV = -v; q = Exp(-v); v = Exp(LnV) }
            else {
                if (v < -15) { LnV = v; Ln1mV = -Exp(v); q = Exp(v); v = Exp(LnV) }
                else { v = 1 / (1 + Exp(-v)); LnV = Ln(v); Ln1mV = Ln(1 - v); q = v * (1 - v) }
            }
            LL = LL - 2 * Y1[i] * LnV - 2 * Y0[i] * Ln1mV;
            for (j = 0; j <= nR; j++) {
                var xij = X[ix(i, j, nR + 1)];
                Arr[ix(j, nR + 1, nR + 2)] = Arr[ix(j, nR + 1, nR + 2)] + xij * (Y1[i] * (1 - v) + Y0[i] * (-v));
                for (k = j; k <= nR; k++) {
                    Arr[ix(j, k, nR + 2)] = Arr[ix(j, k, nR + 2)] + xij * X[ix(i, k, nR + 1)] * q * (Y0[i] + Y1[i]);
                }
            }
        }


        for (j = 1; j <= nR; j++) {
            for (k = 0; k < j; k++) {
                Arr[ix(j, k, nR + 2)] = Arr[ix(k, j, nR + 2)];
            }
        }

        for (i = 0; i <= nR; i++) {
            var s = Arr[ix(i, i, nR + 2)]; Arr[ix(i, i, nR + 2)] = 1;
            for (k = 0; k <= nR + 1; k++) {
                Arr[ix(i, k, nR + 2)] = Arr[ix(i, k, nR + 2)] / s;
            }
            for (j = 0; j <= nR; j++) {
                if (i != j) {
                    s = Arr[ix(j, i, nR + 2)]; Arr[ix(j, i, nR + 2)] = 0;
                    for (k = 0; k <= nR + 1; k++) {
                        Arr[ix(j, k, nR + 2)] = Arr[ix(j, k, nR + 2)] - s * Arr[ix(i, k, nR + 2)];
                    }
                }
            }
        }

        for (j = 0; j <= nR; j++) {
            Par[j] = Par[j] + Arr[ix(j, nR + 1, nR + 2)];
        }

    }

    for (j = 1; j <= nR; j++) {
        Par[j] = Par[j] / xSD[j];
        SEP[j] = Sqrt(Arr[ix(j, j, nP + 1)]) / xSD[j];
        Par[0] = Par[0] - Par[j] * xM[j];
    }

    for (j = 1; j <= nR; j++) {
        var ORc = Exp(Par[j]);
        output.push(ORc);
    }

    return output;
}