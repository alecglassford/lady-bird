import * as d3 from 'd3';

const haveFun = function haveFunFunc(data) {
  const reviews = data.map((d) => {
    const review = d;
    review.date = d3.timeDay(new Date(d.date));
    return d;
  });
  reviews.sort((a, b) => d3.ascending(a.date, b.date));
  let count;
  let prevTime = null;
  for (let i = 0; i < reviews.length; i += 1) {
    if (reviews[i].date.getTime() !== prevTime) {
      prevTime = reviews[i].date.getTime();
      count = 1;
    }
    reviews[i].count = count;
    count += 1;
  }
  console.log(reviews);

  const reviewsByDate = d3.nest()
    .key(d => d.date)
    .rollup(rs => rs.length)
    .entries(reviews);
  const maxInOneDay = d3.max(reviewsByDate, d => d.value);
  console.log(maxInOneDay);

  const margin = 20;
  const width = 760;
  const height = 200;
  const svg = d3.select('svg')
    .attr('width', width + (2 * margin))
    .attr('height', height + (2 * margin));
  const plot = svg.append('g')
    .attr('transform', `translate(${margin},${margin})`);

  const x = d3.scaleTime()
    .domain(d3.extent(reviews, d => d.date))
    .range([0, width]);
  plot.append('g')
    .attr('transform', `translate(0,${height + 1})`)
    .call(d3.axisBottom(x).ticks(d3.timeWeek));
  const y = d3.scaleLinear()
    .domain([0, maxInOneDay])
    .range([height, 0]);

  plot.selectAll('rect').data(reviews).enter().append('rect')
    .style('visibility', 'hidden')
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('x', d => x(d.date) - 5)
    .attr('y', d => y(d.count))
    .attr('width', 10)
    .attr('height', y(0) - y(1))
    .transition()
    .delay((_, i) => i * 50)
    .duration(1000)
    .style('visibility', 'visible');
};

d3.json('reviews.json', haveFun);
