/* 
 * Copyright (C) 2012-2013 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Mediawiki = {};

(function() {

    var contribs_people = null, contribs_people_quarters = null;
    var contribs_companies = null, contribs_companies_quarters = null;
    var new_people = null, new_people_activity;

    Mediawiki.getContribsPeople = function() {
        return contribs_people;
    };

    Mediawiki.getContribsCompanies = function() {
        return contribs_companies;
    };

    Mediawiki.getContribs = function(type, quarters) {
        var contribs_data = null;

        if (type === "companies" && !quarters) 
            contribs_data = contribs_companies;
        else if (type === "companies" && quarters) 
            contribs_data = contribs_companies_quarters;
        else if (type === "people" && !quarters) 
            contribs_data = contribs_people;
        else if (type === "people" && quarters) 
            contribs_data = contribs_people_quarters;
        return contribs_data;
    };

    Mediawiki.getContribsFile = function(type, quarters) {
        var filename = null;
        if (type === "companies" && !quarters)
            filename = Report.getDataDir()+"/scr-companies-all.json";
        else if (type === "companies" && quarters)
            filename = Report.getDataDir()+"/scr-companies-quarters.json";
        else if (type === "people" && !quarters) 
            filename = Report.getDataDir()+"/scr-people-all.json";
        else if (type === "people" && quarters)
            filename = Report.getDataDir()+"/scr-people-quarters.json";
        return filename;    
    };

    Mediawiki.setContribs = function (type, quarters, data) {
        if (type === "people" && !quarters) contribs_people = data;
        if (type === "people" && quarters) contribs_people_quarters = data;
        if (type === "companies" && !quarters) contribs_companies = data;
        if (type === "companies" && quarters) contribs_companies_quarters = data;
    };


    function getIdByName(item, type) {
        var id = 0;
        var data = null; 
        if (type === "companies")
            data = Mediawiki.getContribsCompanies();
        else if (type === "people")
            data = Mediawiki.getContribsPeople();
        else return id;

        for (var i = 0; i<data.id.length;i++) {
            if (data.name[i] === item) {
                id = data.id[i];
                break;
            }
        }
        return id;
    }

    function showContribs(div, type, quarter, search, show_links) {
        var quarters = false;
        if (quarter) quarters = true;
        var contribs_data = Mediawiki.getContribs(type, quarters);
        if (quarter) contribs_data = contribs_data[quarter];
        var html = "", table = "";

        table += "<table class='table-hover'>";
        var id, name, total;
        for (var i = 0; i<contribs_data.id.length;i++) {
           name = contribs_data.name[i];
           total = contribs_data.total[i];
           id = contribs_data.id[i];
           table += "<tr><td>";
           if (type === "people" && show_links)
               table += "<a href='people.html?id="+id+"&name="+name+"'>";
           if (type === "companies" && show_links)
               table += "<a href='company.html?company="+name+"'>";
           table += name;
           if (show_links) table += "</a>";
           table += "</td><td>"+total;
           table += "</td></tr>";
        }
        table += "</table>";
        if (search) {
            html +="<FORM>Search ";
            html +='<input type="text" class="typeahead">';
            html += "</FORM>";
        }
        html += table;
        var data_source = null, updater = null;

        if (type === "people") {
            data_source = contribs_people.name;
            updater = function(item) {
                var id = getIdByName(item, type);
                var url = "people.html?id="+id+"&name="+item;
                window.open(url,"_self");
                return item;
            };
        }
        else if (type === "companies") {
            data_source = contribs_companies.name;
            updater = function(item) {
                var id = getIdByName(item, type);
                var url = "company.html?id="+id+"&name="+item;
                window.open(url,"_self");
                return item;
            };
        }

        $("#"+div).append(html);
        $('.typeahead').typeahead({
            source: data_source,
            updater: updater
        });
    }

    // Load all needed info at the start
    function loadContribs (cb) {
        $.when($.getJSON(Mediawiki.getContribsFile('people',false)),
               $.getJSON(Mediawiki.getContribsFile('people',true)),
               $.getJSON(Mediawiki.getContribsFile('companies',false)),
               $.getJSON(Mediawiki.getContribsFile('companies',true))
            ).done(function(ppl, ppl_quarters, comp, comp_quarters) {
                Mediawiki.setContribs ('people', false, ppl[0]);
                Mediawiki.setContribs ('people', true, ppl_quarters[0]);
                Mediawiki.setContribs ('companies', false, comp[0]);
                Mediawiki.setContribs ('companies', true, comp_quarters[0]);
                cb();
        });
    }

    function displayContribs(div, type, quarter, search, show_links) {
        var quarters = false;
        if (quarter) quarters = true;
        showContribs(div, type, quarter, search, show_links);
    }

    Mediawiki.getNewPeopleFile = function() {
        return Report.getDataDir()+"/scr-code-contrib.json";
    };

    function loadNewPeople (cb) {
        $.when($.getJSON(Mediawiki.getNewPeopleFile())
            ).done(function(new_people) {
                Mediawiki.setNewPeople (new_people);
                cb();
        });
    }

    Mediawiki.setNewPeople = function (data) {
        new_people = data;
    };

    Mediawiki.getNewPeople = function (type) {
        if (type === undefined) return new_people;
        else return new_people[type];
    };

    // Show tables with selected fields
    function displayNewPeople(divid, type, limit) {
        var table = "<table>";
        var data = Mediawiki.getNewPeople(type);
        var field;
        table += "<tr>";
        table += "<th>Name</th><th>Submitted on</th>";
        if (data.revtime !== undefined)
            table += "<th>Revision days</th>";
        table += "</tr>";
        for (var i=0; i < data.name.length && i<limit; i++) {
            // Remove time
            var sub_on_date = data.submitted_on[i].split(" ")[0];
            table += "<tr>";
            table += "<td>"+data.name[i]+"</td>";
            table += "<td><a href='"+data.url[i]+"'>"+sub_on_date+"</a></td>";
            if (data.revtime !== undefined)
                table += "<td>"+Report.formatValue(data.revtime[i])+"</td>";
            table += "</tr>";
        }
        table += "</table>";
        $("#"+divid).html(table);
    }

    // Show full tables with all new people data
    // email, name, revtime, submitted_by, submitted_on, url
    function displayNewPeopleDebug(divid, type) {
        var table = "<table>";
        var data = Mediawiki.getNewPeople(type);
        var field;
        table += "<tr>";
        $.each(data, function(key, value) {
            field = key;
            table += "<td>"+key+"</td>"
        });
        table += "</tr>";
        for (var i=0; i < data[field].length; i++) {
            table += "<tr>";
            $.each(data, function(key, value) {
                if (key === "url")
                table += "<td><a href='"+value[i]+"'>url</a></td>";
                else table += "<td>"+value[i]+"</td>"
            });
            table += "</tr>";
        }

        table += "</table>";
        $("#"+divid).html(table);
    }

    Mediawiki.getNewPeopleActivityFile = function() {
        return Report.getDataDir()+"/new-people-activity-scr-evolutionary.json";
    };


    Mediawiki.setNewPeopleActivity = function (data) {
        new_people_activity = data;
    };

    Mediawiki.getNewPeopleActivity = function () {
        return new_people_activity;
    };

    function loadNewPeopleActivity (cb) {
        $.when($.getJSON(Mediawiki.getNewPeopleActivityFile())
            ).done(function(activity) {
                Mediawiki.setNewPeopleActivity (activity);
                cb();
        });
    }

    // Show graphs with evolution in time of people
    function displayNewPeopleActivity(divid, limit) {
        var config = {};
        config.help = false;
        config.show_title = false;
        config.frame_time = true;
        var data = Mediawiki.getNewPeopleActivity();
        var new_data = {};
        new_data.id = data.id;
        new_data.month = data.month;
        new_data.date = data.date;
        new_data.unixtime = data.unixtime;
        var i = 0;
        $.each(data.people, function(key, value) {
            people_divid = divid+"-"+key;
            var newdiv = "<h4>"+key+"</h4>";
            newdiv += "<div class='subreport-list-item' ";
            newdiv += "id="+people_divid+"></div>";
            $("#"+divid).append(newdiv)
            new_data.changes = value.changes;
            Viz.displayMetricsEvol(["changes"], new_data, people_divid, config);
            if (limit && ++i>=limit) return false;
        });
    }

    // All sample function
    function displayTopList(div, ds, limit) {
        var top_file = ds.getTopDataFile();
        var basic_metrics = ds.getMetrics();

        $.getJSON(top_file, function(history) {
            $.each(history, function(key, value) {
                // ex: commits.all
                var data = key.split(".");
                var top_metric = data[0];
                var top_period = data[1];
                // List only all period 
                if (top_period !== "") return false;
                for (var id in basic_metrics) {
                    var metric = basic_metrics[id];
                    var html = '';
                    if (metric.column == top_metric) {
                        html = "<h4>"+top_metric+"</h4><ul>";
                        var top_data = value[top_metric];
                        var top_id = value.id;
                        for (var i=0; i<top_data.length; i++) {
                            html += "<li><a href='people.html?id=";
                            html += top_id[i]+"&name="+top_data[i]+"'>";
                            html += top_data[i]+"</a></li>";
                        }
                        html += "</ul>";
                        $("#"+div).append(html);
                        return false;
                    }
                }
            });
        });


    }

    function convertTop() {
        $.each(Report.getDataSources(), function(index, ds) {
            if (ds.getData().length === 0) return;

            var div_id_top = ds.getName()+"-top-mw";

            if ($("#"+div_id_top).length > 0) {
                if ($("#"+div_id_top).data('show_all')) show_all = true;
                var limit = $("#"+div_id_top).data('limit');
                displayTopList(div_id_top, ds, limit);
            }
        });
    }

    Mediawiki.convertContribs = function() {
        var mark = "Contribs";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                var type = $(this).data('type');
                var quarter = $(this).data('quarter');
                var search = $(this).data('search');
                if (search === undefined) search = true;
                var show_links = true;
                if ($(this).data('show_links') !== undefined)
                    show_links = $(this).data('show_links');
                displayContribs(div.id, type, quarter, search, show_links);
            });
        }
    }

    Mediawiki.convertNewPeople = function() {
        var mark = "NewPeople";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                var type = $(this).data('type');
                var limit = $(this).data('limit');
                displayNewPeople(div.id, type, limit);
            });
        }
    }

    Mediawiki.convertNewPeopleActivity = function() {
        var mark = "NewPeopleActivity";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                var ds = $(this).data('ds');
                var limit = $(this).data('limit');
                displayNewPeopleActivity(div.id, limit);
            });
        }
    }

    
    Mediawiki.build = function() {
        loadContribs(Mediawiki.convertContribs);
        loadNewPeople(Mediawiki.convertNewPeople);
        loadNewPeopleActivity(Mediawiki.convertNewPeopleActivity);
    };
})();

Loader.data_ready(function() {
    Mediawiki.build();
});
