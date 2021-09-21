require("../init.js");
var fs = require('fs');
const os = require('os');

test("exponential random variable", () => {
	let rv = ExponentialRandomVariable.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let rvMode = rv.getMode();
	let pdfMean = rv.pdf(rv.getMean());
	let cdfMean = rv.cdf(rv.getMean());
	let pdfMedian = rv.pdf(rv.getMedian());
	let cdfMedian = rv.cdf(rv.getMedian());
	let quantile5 = rv.getQuantile(0.5);
	let quantile75 = rv.getQuantile(0.75);
	let quantile9 = rv.getQuantile(0.9);
	let simValue = 	rv.getValue();
});

test("normal random variable", () => {
	let rv = NormalRandomVariable.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let rvMode = rv.getMode();
	let pdfMean = rv.pdf(rv.getMean());
	let cdfMean = rv.cdf(rv.getMean());
	let pdfMedian = rv.pdf(rv.getMedian());
	let cdfMedian = rv.cdf(rv.getMedian());
	let quantile5 = rv.getQuantile(0.5);
	let quantile75 = rv.getQuantile(0.75);
	let quantile9 = rv.getQuantile(0.9);
	let simValue = 	rv.getValue();
});

test("log-normal random variable", () => {
	let rv = LogNormalRandomVariable.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let rvMode = rv.getMode();
	let pdfMean = rv.pdf(rv.getMean());
	let cdfMean = rv.cdf(rv.getMean());
	let pdfMedian = rv.pdf(rv.getMedian());
	let cdfMedian = rv.cdf(rv.getMedian());
	let quantile5 = rv.getQuantile(0.5);
	let quantile75 = rv.getQuantile(0.75);
	let quantile9 = rv.getQuantile(0.9);
	let simValue = 	rv.getValue();
});

test("gamma random variable", () => {
	let rv = GammaRandomVariable.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let rvMode = rv.getMode();
	let pdfMean = rv.pdf(rv.getMean());
	let simValue = 	rv.getValue();
});

test("uniform random variable", () => {
	let rv = UniformRandomVariable.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let rvMode = rv.getMode();
	let pdfMean = rv.pdf(rv.getMean());
	let cdfMean = rv.cdf(rv.getMean());
	let pdfMedian = rv.pdf(rv.getMedian());
	let cdfMedian = rv.cdf(rv.getMedian());
	let quantile5 = rv.getQuantile(0.5);
	let quantile75 = rv.getQuantile(0.75);
	let quantile9 = rv.getQuantile(0.9);
	let simValue = 	rv.getValue();
});

test("exponentially modified gaussian random variable", () => {
	let rv = ExponentiallyModifiedGaussian.estimateParameters([1.9, 2, 2.1]);
	let rvMean = rv.getMean();
	let rvVariance = rv.getVariance();
	let pdfMean = rv.pdf(rv.getMean());
	let simValue = 	rv.getValue();
});