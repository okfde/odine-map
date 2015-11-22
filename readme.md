#Development Version Undine Map

Data-Generator & Web App for a Clustered & Filter Map

##To Discuss
* Invalid data (e.g. City: Athens, Country: Austria)
* Incomplete data (e.g. no city)
* Grouping in filter for "Year", "Country"?
* Mutli-Select or Single-List-Select? // now: Multi
* Design/Colors
* Use cities or country centers for marker positions // now: Cities 
* Mobile version?

##Used Software
you need <a href="http://gruntjs.com/">grunt</a> & <a href="http://bower.io/">bower</a>

##Install

run 'bower install' in 'app/assets' to install third party libraries
run 'npm install' in 'bin' to install third party grunt libraries

##Use

run 'grunt' in 'bin' to generate the json file from the tsv and build the final web app

open 'dist/index.html'

Please note: some browsers like Safari won't load json data if a local html file is opened, use Firefox or Chrome for local previewing.  