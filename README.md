# Simple Dashboard App
Single Page Application (SPA) Dashboard using AngularJS and Ruby on Rails for a job application. 
Dashboard panels are rendered using widgets (directives) that can be appended or deleted accordingly using AngularJS controllers.
Panel data are gathered by an AngularJS controller using a ```GET/``` request to the server, which gets routed & handled by a Ruby on Rails controller, which then queries JOB's server with parameters for respective data and formatted into JSON, returned to the AngularJS controller.

The application uses the following front-end libraries:
* Angular - Obvious addition that does most of the front-end work
* Bootstrap (SASS) - For CSS classes and templates, such as panels and navbars
* font-awesome - For icons such as refresh, arrows 
* Chart.js - For charts, such as line, bar
* ngmap - For Google Maps, using original Google maps API.

Perfect for learning how to use AngularJS controllers and directives (communication and sharing scope), AngularJS communicating with Ruby on Rails, and getting started with a Ruby on Rails application.

### Installing Ruby on Rails

1. Install (Ruby)[http://rubyonrails.org/download/] I used 2.0.0
2. Install the DevKit for additional gems (libraries)
3. (Windows) Usng Command Prompt run the following ```gem install rails```

### Installing Bower

1. Install (node.js)[https://nodejs.org/en/]
2. Install (git)[https://git-for-windows.github.io/]
3. Make sure to tick [x] Run Git from the Windows Command Prompt when prompted.
4. (Windows) Using Command Prompt run the following ```npm install -g bower```

### Using Bower with Ruby on Rails

NOTE: Run only steps 3 and 4 if importing from my project

1. In your projects gemfile include gem 'bower-rails'
2. Configure in bower.json in dependencies what libraries you want to use, to create one use ```bower init```
3. Navigate to your project folder in Command Prompt and run ```bundle install```, which will navigate the gemfile and install all gems
4. Run ```rake bower:install```, which will navigate the bower.json file and install all libraries
5. Next, we need to allow the libraries installed by bower to be accessible by the ruby on rails server. The libraries should be located at vendor/assets/bower_components, go to config/application.rb and include this line ``` config.assets.paths << Rails.root.join("vendor","assets","bower_components")```
6. These files should now be accessible by Ruby on Rails :).

### Including Bower libraries with Ruby on Rails

1. JavaScript - In app/assets/javascript there should be a application.js file. These are the JavaScript files included in application.html.erb view, if you followed Step 5 above, starting from the bower_components folder use ```//= require path/to/script/scriptName``` (do NOT include .js). E.g ```//= require angular/angular``` which is located in bower_components
2. CSS - In app/assets/stylesheets there should be a application.css.scss. These are the Stylesheet files included in application.html.erb view, if you followed Step 5 above, starting from the bower_components folder use ```//= import "path/to/script/stylesheetName``` (do not include .css or .scss)

### Recommendations

* Remove turbolinks from Gemfile if using AngularJS
* Use ruby's javascript_include_tag and stylesheet_link_tag to import external scripts and stylesheets respectively (The ruby way!)

#### Happy Coding! 
