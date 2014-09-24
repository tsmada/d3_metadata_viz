var App = angular.module('SIMDOT', ['ui.utils']);
var reset = true;
angular.module('SIMDOT')
    .service('dataService', function() {
        var data = {}
        return {
            getData: function() {
                return data;
            },
            setData: function(value) {
                data = value;
            }
        };
    });

angular.module('SIMDOT')
    .service('dataService1', function() {
        var data = {}
        return {
            getData: function() {
                return data;
            },
            setData: function(value) {
                data = value;
            }
        };
    });

angular.module('SIMDOT')
    .service('mapService', function() {
        var data = {}
        return {
            getData: function() {
                return data;
            },
            setData: function(value) {
                data = value;
            }
        };
    });

App.directive('d3', function($parse, $window, dataService, dataService1, $http, mapService) {
    return {
        restrict: 'EA',
        //template:"<svg width='850' height='200'></svg>",
        //scope: {data: '=chartData'},
        link: function(scope, elem, attrs) {
            //scope.$apply();
            scope.$watch('data', function() {
                if (reset == false) {
                    console.log(reset);
                    reset = true;
                    $('svg').remove();
                    console.log("data changed");
                    var tooltip = d3.select("head")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("position", "absolute")
                        .style("x-index", "50")
                        .style("opacity", 0)
                        .style("font-weight", "bold")
                        .style("font-size", "250%");

                    var diameter = 800,
                        radius = diameter / 2,
                        innerRadius = radius - 120;

                    var cluster = d3.layout.cluster()
                        .size([360, innerRadius])
                        .sort(null)
                        .value(function(d) {
                            return d.size;
                        });

                    var bundle = d3.layout.bundle();

                    var line = d3.svg.line.radial()
                        .interpolate("bundle")
                        .tension(1)
                        .radius(function(d) {
                            return d.y;
                        })
                        .angle(function(d) {
                            return d.x / 180 * Math.PI;
                        });

                    var svg = d3.select(".span11").append("svg")
                        .attr("width", diameter)
                        .attr("height", diameter)
                        .attr("class", "svgmain")
                        .append("g")
                        .attr("transform", "translate(" + radius + "," + radius + ")")
                        .attr("class", "svgmain");

                    var link = svg.append("g").selectAll(".link"),
                        node = svg.append("g").selectAll(".node");


                    //d3.json("outputv1.json", function(error, classes) {

                    //dataService1.setData(classes);

                    //var classes = dataService.getData();
                    var classes = mapService.getData().slice(0, 100);
                    var nodes = cluster.nodes(packageHierarchy(classes))
                    var links = packageImports(nodes);
                    link = link
                        .data(bundle(links))
                        .enter().append("path")
                        .each(function(d) {
                            d.source = d[0], d.target = d[d.length - 1];
                        })
                        .attr("class", "link")
                        .attr("d", line);

                    node = node
                        .data(nodes.filter(function(n) {
                            return !n.children;
                        }))
                        .enter().append("text")
                        .attr("class", "node")
                        .attr("dy", ".31em")
                        .attr("transform", function(d) {
                            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
                        })
                        .style("text-anchor", function(d) {
                            return d.x < 180 ? "start" : "end";
                        })
                        .text(function(d) {
                            return d.key;
                        })
                        .on("mouseover", mouseovered)
                        .on("mouseout", mouseouted);


                    function mouseovered(d) {
                        var obj = {};
                        //dataService.setData(d);

                        node
                            .each(function(n) {
                                n.target = n.source = false;
                            });

                        link
                            .classed("link--target", function(l) {
                                if (l.target === d) return l.source.source = true;
                            })
                            .classed("link--source", function(l) {
                                if (l.source === d) return l.target.target = true;
                            })
                            .filter(function(l) {
                                return l.target === d || l.source === d;
                            })
                            .each(function() {
                                this.parentNode.appendChild(this);
                            });

                        node
                            .classed("node--target", function(n) {
                                return n.target;
                            })
                            .classed("node--source", function(n) {
                                return n.source;
                            });

                        tooltip.html(function() {
                            var datas = [];
                            //var indexs = dataService1.getData();
                            var mappings = (dataService.getData());
                            //console.log(dataService.getData());
                            if (d.rows) {
                                for (var rows in d.rows) {
                                    console.log(rows);
                                    for (i = 0; i < mappings.length; i++) {
                                        if (mappings[i].row == rows) {
                                            console.log(mappings[i]);
                                            datas += mappings[i];

                                        }
                                    }
                                }
                            }
                            return d.name.substring(11);
                        })
                        return tooltip.transition()
                            .duration(50)
                            .style("opacity", 0.9);
                    }

                    function mouseouted(d) {
                        link
                            .classed("link--target", false)
                            .classed("link--source", false);

                        node
                            .classed("node--target", false)
                            .classed("node--source", false);
                    }

                    d3.select(self.frameElement).style("height", diameter + "px");

                    // Lazily construct the package hierarchy from class names.
                    function packageHierarchy(classes) {
                        var map = {};

                        function find(name, data) {
                            var node = map[name],
                                i;
                            if (!node) {
                                node = map[name] = data || {
                                    name: name,
                                    children: [],
                                    rows: []
                                };
                                if (name.length) {
                                    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                                    node.parent.children.push(node);
                                    node.key = name.substring(i + 1);
                                }
                            }
                            return node;
                        }

                        try {
                            classes.forEach(function(d) {
                                find(d.name, d);
                            });
                        } catch (err) {
                            console.log(err.message);
                        }

                        return map[""];
                    }

                    // Return a list of imports for the given array of nodes.
                    function packageImports(nodes) {
                        var map = {},
                            imports = [];

                        // Compute a map from name to node.
                        nodes.forEach(function(d) {
                            map[d.name] = d;
                        });

                        // For each import, construct a link from the source to target node.

                        nodes.forEach(function(d) {
                            if (d.imports) d.imports.forEach(function(i) {
                                imports.push({
                                    source: map[d.name],
                                    target: map[i]
                                });
                            });
                        });

                        return imports;
                    }
                } else if (reset == true) {
                    $('svg').remove();
                    var tooltip = d3.select("head")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("x-index", "50")
                .style("opacity", 0)
                .style("font-weight", "bold")
                .style("font-size", "250%");

            var diameter = 800,
                radius = diameter / 2,
                innerRadius = radius - 120;

            var cluster = d3.layout.cluster()
                .size([360, innerRadius])
                .sort(null)
                .value(function(d) {
                    return d.size;
                });

            var bundle = d3.layout.bundle();

            var line = d3.svg.line.radial()
                .interpolate("bundle")
                .tension(1)
                .radius(function(d) {
                    return d.y;
                })
                .angle(function(d) {
                    return d.x / 180 * Math.PI;
                });

            var svg = d3.select(".span11").append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "svgmain")
                .append("g")
                .attr("transform", "translate(" + radius + "," + radius + ")")
                .attr("class", "svgmain");

            var link = svg.append("g").selectAll(".link"),
                node = svg.append("g").selectAll(".node");


            //d3.json("outputv1.json", function(error, classes) {

            //dataService1.setData(classes);
            var classe = $http.get('outputv1.json')
                .then(function(res) {
                    mapService.setData(res.data);
                    reset = false;
                    var classes = res.data;
                    dataService.setData(res.data);
                    var nodes = cluster.nodes(packageHierarchy(classes))
                    var links = packageImports(nodes);
                    link = link
                        .data(bundle(links))
                        .enter().append("path")
                        .each(function(d) {
                            d.source = d[0], d.target = d[d.length - 1];
                        })
                        .attr("class", "link")
                        .attr("d", line);

                    node = node
                        .data(nodes.filter(function(n) {
                            return !n.children;
                        }))
                        .enter().append("text")
                        .attr("class", "node")
                        .attr("dy", ".31em")
                        .attr("transform", function(d) {
                            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
                        })
                        .style("text-anchor", function(d) {
                            return d.x < 180 ? "start" : "end";
                        })
                        .text(function(d) {
                            return d.key;
                        })
                        .on("mouseover", mouseovered)
                        .on("mouseout", mouseouted);
                });


            function mouseovered(d) {
                var obj = {};
                //dataService.setData(d);

                node
                    .each(function(n) {
                        n.target = n.source = false;
                    });

                link
                    .classed("link--target", function(l) {
                        if (l.target === d) return l.source.source = true;
                    })
                    .classed("link--source", function(l) {
                        if (l.source === d) return l.target.target = true;
                    })
                    .filter(function(l) {
                        return l.target === d || l.source === d;
                    })
                    .each(function() {
                        this.parentNode.appendChild(this);
                    });

                node
                    .classed("node--target", function(n) {
                        return n.target;
                    })
                    .classed("node--source", function(n) {
                        return n.source;
                    });

                tooltip.html(function() {
                    var datas = [];
                    //var indexs = dataService1.getData();
                    var mappings = (dataService.getData());
                    //console.log(dataService.getData());
                    if (d.rows) {
                        for (var rows in d.rows) {
                            console.log(rows);
                            for (i = 0; i < mappings.length; i++) {
                                if (mappings[i].row == rows) {
                                    console.log(mappings[i]);
                                    datas += mappings[i];

                                }
                            }
                        }
                    }
                    return d.name.substring(11);
                })
                return tooltip.transition()
                    .duration(50)
                    .style("opacity", 0.9);
            }

            function mouseouted(d) {
                link
                    .classed("link--target", false)
                    .classed("link--source", false);

                node
                    .classed("node--target", false)
                    .classed("node--source", false);
            }

            d3.select(self.frameElement).style("height", diameter + "px");

            // Lazily construct the package hierarchy from class names.
            function packageHierarchy(classes) {
                var map = {};

                function find(name, data) {
                    var node = map[name],
                        i;
                    if (!node) {
                        node = map[name] = data || {
                            name: name,
                            children: [],
                            rows: []
                        };
                        if (name.length) {
                            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                            node.parent.children.push(node);
                            node.key = name.substring(i + 1);
                        }
                    }
                    return node;
                }

                try {
                    classes.forEach(function(d) {
                        find(d.name, d);
                    });
                } catch (err) {
                    console.log(err.message);
                }

                return map[""];
            }

            // Return a list of imports for the given array of nodes.
            function packageImports(nodes) {
                var map = {},
                    imports = [];

                // Compute a map from name to node.
                nodes.forEach(function(d) {
                    map[d.name] = d;
                });

                // For each import, construct a link from the source to target node.

                nodes.forEach(function(d) {
                    if (d.imports) d.imports.forEach(function(i) {
                        imports.push({
                            source: map[d.name],
                            target: map[i]
                        });
                    });
                });

                return imports;
            }
                }

            });



            var tooltip = d3.select("head")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("x-index", "50")
                .style("opacity", 0)
                .style("font-weight", "bold")
                .style("font-size", "250%");

            var diameter = 800,
                radius = diameter / 2,
                innerRadius = radius - 120;

            var cluster = d3.layout.cluster()
                .size([360, innerRadius])
                .sort(null)
                .value(function(d) {
                    return d.size;
                });

            var bundle = d3.layout.bundle();

            var line = d3.svg.line.radial()
                .interpolate("bundle")
                .tension(1)
                .radius(function(d) {
                    return d.y;
                })
                .angle(function(d) {
                    return d.x / 180 * Math.PI;
                });

            var svg = d3.select(".span11").append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "svgmain")
                .append("g")
                .attr("transform", "translate(" + radius + "," + radius + ")")
                .attr("class", "svgmain");

            var link = svg.append("g").selectAll(".link"),
                node = svg.append("g").selectAll(".node");


            //d3.json("outputv1.json", function(error, classes) {

            //dataService1.setData(classes);
            var classe = $http.get('outputv1.json')
                .then(function(res) {
                    mapService.setData(res.data);
                    reset = false;
                    var classes = res.data;
                    dataService.setData(res.data);
                    var nodes = cluster.nodes(packageHierarchy(classes))
                    var links = packageImports(nodes);
                    link = link
                        .data(bundle(links))
                        .enter().append("path")
                        .each(function(d) {
                            d.source = d[0], d.target = d[d.length - 1];
                        })
                        .attr("class", "link")
                        .attr("d", line);

                    node = node
                        .data(nodes.filter(function(n) {
                            return !n.children;
                        }))
                        .enter().append("text")
                        .attr("class", "node")
                        .attr("dy", ".31em")
                        .attr("transform", function(d) {
                            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
                        })
                        .style("text-anchor", function(d) {
                            return d.x < 180 ? "start" : "end";
                        })
                        .text(function(d) {
                            return d.key;
                        })
                        .on("mouseover", mouseovered)
                        .on("mouseout", mouseouted);
                });


            function mouseovered(d) {
                var obj = {};
                //dataService.setData(d);

                node
                    .each(function(n) {
                        n.target = n.source = false;
                    });

                link
                    .classed("link--target", function(l) {
                        if (l.target === d) return l.source.source = true;
                    })
                    .classed("link--source", function(l) {
                        if (l.source === d) return l.target.target = true;
                    })
                    .filter(function(l) {
                        return l.target === d || l.source === d;
                    })
                    .each(function() {
                        this.parentNode.appendChild(this);
                    });

                node
                    .classed("node--target", function(n) {
                        return n.target;
                    })
                    .classed("node--source", function(n) {
                        return n.source;
                    });

                tooltip.html(function() {
                    var datas = [];
                    //var indexs = dataService1.getData();
                    var mappings = (dataService.getData());
                    //console.log(dataService.getData());
                    if (d.rows) {
                        for (var rows in d.rows) {
                            console.log(rows);
                            for (i = 0; i < mappings.length; i++) {
                                if (mappings[i].row == rows) {
                                    console.log(mappings[i]);
                                    datas += mappings[i];

                                }
                            }
                        }
                    }
                    return d.name.substring(11);
                })
                return tooltip.transition()
                    .duration(50)
                    .style("opacity", 0.9);
            }

            function mouseouted(d) {
                link
                    .classed("link--target", false)
                    .classed("link--source", false);

                node
                    .classed("node--target", false)
                    .classed("node--source", false);
            }

            d3.select(self.frameElement).style("height", diameter + "px");

            // Lazily construct the package hierarchy from class names.
            function packageHierarchy(classes) {
                var map = {};

                function find(name, data) {
                    var node = map[name],
                        i;
                    if (!node) {
                        node = map[name] = data || {
                            name: name,
                            children: [],
                            rows: []
                        };
                        if (name.length) {
                            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                            node.parent.children.push(node);
                            node.key = name.substring(i + 1);
                        }
                    }
                    return node;
                }

                try {
                    classes.forEach(function(d) {
                        find(d.name, d);
                    });
                } catch (err) {
                    console.log(err.message);
                }

                return map[""];
            }

            // Return a list of imports for the given array of nodes.
            function packageImports(nodes) {
                var map = {},
                    imports = [];

                // Compute a map from name to node.
                nodes.forEach(function(d) {
                    map[d.name] = d;
                });

                // For each import, construct a link from the source to target node.

                nodes.forEach(function(d) {
                    if (d.imports) d.imports.forEach(function(i) {
                        imports.push({
                            source: map[d.name],
                            target: map[i]
                        });
                    });
                });

                return imports;
            }
        }
    }

});

angular.module('SIMDOT')
    .controller('DataCtrl', ['$scope', '$http', 'dataService', 'dataService1', 'mapService',
        function($scope, $http, dataService, dataService1, mapService) {
            var defval = "label label-info";
            $scope.classDomain = defval;
            $scope.classFunctions = defval;
            $scope.classTypes = defval;
            $scope.classDwor = defval;
            $scope.classInterfacetype = defval;

            $scope.changeClass = function(value) {
                switch (value) {
                    case 'functions':
                        $scope.classFunctions = "label label-danger";
                        break;
                    case 'dwor':
                        $scope.classDwor = "label label-danger";
                        break;
                    case 'types':
                        $scope.classTypes = "label label-danger";
                        break;
                    case 'domain':
                        $scope.classDomain = "label label-danger";
                        break;
                    case 'interfacetype':
                        $scope.classInterfacetype = "label label-danger";
                        break;
                };
            }

            $scope.functions = function(value) {
                var newdata = [];
                //console.log(value);
                for (var domain in $scope.data) {
                    if ($scope.data[domain].functions == value) {
                        //console.log($scope.data[domain]);
                        newdata.push($scope.data[domain]);
                        $scope.$watch(newdata, function(newVal, oldVal) {
                            $scope.data = newdata;
                        });
                    }
                }
            };
            $scope.interfacetype = function(value) {
                var newdata = [];
                console.log(value);
                for (var domain in $scope.data) {
                    if ($scope.data[domain].interfacetype == value) {
                        //console.log($scope.data[domain]);
                        newdata.push($scope.data[domain]);
                        $scope.$watch(newdata, function(newVal, oldVal) {
                            $scope.data = newdata;
                        });
                    }
                }
            };
            $scope.types = function(value) {
                var newdata = [];
                console.log(value);
                for (var domain in $scope.data) {
                    if ($scope.data[domain].types == value) {
                        //console.log($scope.data[domain]);
                        newdata.push($scope.data[domain]);
                        $scope.$watch(newdata, function(newVal, oldVal) {
                            $scope.data = newdata;
                        });
                    }
                }
            };
            $scope.dwor = function(value) {
                var newdata = [];
                //console.log(value);
                for (var domain in $scope.data) {
                    if ($scope.data[domain].dwor == value) {
                        //console.log($scope.data[domain]);
                        newdata.push($scope.data[domain]);
                        $scope.$watch(newdata, function(newVal, oldVal) {
                            $scope.data = newdata;
                        });
                    }
                }
            };
            $http.get('outputtest.json')
                .then(function(res) {
                    dataService1.setData(res.data);
                    var newdata = new Object();
                    $scope.todos = res.data;
                    $scope.data = res.data;
                });
            $scope.reset = function() {
                var defval = "label label-info"
                $scope.data = $scope.todos;
                $scope.classDomain = defval;
                $scope.classFunctions = defval;
                $scope.classTypes = defval;
                $scope.classDwor = defval;
                $scope.classInterfacetype = defval;
                reset = true;
                console.log(reset);
            };
            $scope.domains = function(value) {
                var newdata = [];
                for (var domain in $scope.data) {
                    if ($scope.data[domain].riskdomain == value) {
                        console.log($scope.data[domain]);
                        newdata.push($scope.data[domain]);
                    }
                };

            $scope.$watch('data2', function() { $scope.data = newdata;});

            }

        }
    ]);