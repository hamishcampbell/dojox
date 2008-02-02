dojo.provide("dojox.dtl.tests.text.tag");

dojo.require("dojox.dtl");

doh.register("dojox.dtl.text.tag", 
	[
		function test_tag_block_and_extends(t){
			var dd = dojox.dtl;

			// Simple (messy) string-based extension
			var template = new dd.Template('{% extends "../../dojox/dtl/tests/text/templates/pocket.html" %}{% block pocket %}Simple{% endblock %}');
			t.is("Simple Pocket", template.render());

			// Variable replacement
			var context = new dd.Context({
				parent: "../../dojox/dtl/tests/text/templates/pocket.html"
			})
			template = new dd.Template('{% extends parent %}{% block pocket %}Variabled{% endblock %}');
			t.is("Variabled Pocket", template.render(context));

			// Nicer dojo.moduleUrl and variable based extension
			context.parent = dojo.moduleUrl("dojox.dtl.tests.text.templates", "pocket.html");
			template = new dd.Template('{% extends parent %}{% block pocket %}Slightly More Advanced{% endblock %}');
			t.is("Slightly More Advanced Pocket", template.render(context));

			// dojo.moduleUrl with support for more variables.
			// This is important for HTML templates where the "shared" flag will be important.
			context.parent = {
				url: dojo.moduleUrl("dojox.dtl.tests.text.templates", "pocket.html")
			}
			template = new dd.Template('{% extends parent %}{% block pocket %}Super{% endblock %}');
			t.is("Super Pocket", template.render(context));
		},
		function test_tag_comment(t){
			var dd = dojox.dtl;

			var template = new dd.Template('Hot{% comment %}<strong>Make me disappear</strong>{% endcomment %} Pocket');
			t.is("Hot Pocket", template.render());

			var found = false;
			try{
				template = new dd.Template('Hot{% comment %}<strong>Make me disappear</strong> Pocket');
			}catch(e){
				t.is("Unclosed tag found when looking for endcomment", e.message);
				found = true;
			}
			t.t(found);
		},
		function test_tag_cycle(t){
			var dd = dojox.dtl;

			var context = new dd.Context({
				items: ["apple", "banana", "lemon"],
				unplugged: "Torrey"
			});
			var template = new dd.Template("{% for item in items %}{% cycle 'Hot' 'Diarrhea' unplugged 'Extra' %} Pocket. {% endfor %}");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));
			// Make sure that it doesn't break on re-render
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));

			// Test repeating the loop
			context.items.push("guava", "mango", "pineapple");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. Extra Pocket. Hot Pocket. Diarrhea Pocket. ", template.render(context));

			// Repeat the above tests for the old style
			// ========================================
			context.items = context.items.slice(0, 3);
			template = new dd.Template("{% for item in items %}{% cycle Hot,Diarrhea,Torrey,Extra %} Pocket. {% endfor %}");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));
			// Make sure that it doesn't break on re-render
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));

			// Test repeating the loop
			context.items.push("guava", "mango", "pineapple");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. Extra Pocket. Hot Pocket. Diarrhea Pocket. ", template.render(context));

			// Now test outside of the for loop
			// ================================
			context = new dojox.dtl.Context({ unplugged: "Torrey" });
			template = new dd.Template("{% cycle 'Hot' 'Diarrhea' unplugged 'Extra' as steakum %} Pocket. {% cycle steakum %} Pocket. {% cycle steakum %} Pocket.");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket.", template.render(context));

			template = new dd.Template("{% cycle 'Hot' 'Diarrhea' unplugged 'Extra' as steakum %} Pocket. {% cycle steakum %} Pocket. {% cycle steakum %} Pocket. {% cycle steakum %} Pocket. {% cycle steakum %} Pocket. {% cycle steakum %} Pocket.");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. Extra Pocket. Hot Pocket. Diarrhea Pocket.", template.render(context));

			// Test for nested objects
			context.items = {
				list: ["apple", "banana", "lemon"]
			};
			template = new dd.Template("{% for item in items.list %}{% cycle 'Hot' 'Diarrhea' unplugged 'Extra' %} Pocket. {% endfor %}");
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));
			// Make sure that it doesn't break on re-render
			t.is("Hot Pocket. Diarrhea Pocket. Torrey Pocket. ", template.render(context));
		},
		function test_tag_debug(t){
			var dd = dojox.dtl;

			var context = new dd.Context({
				items: ["apple", "banana", "lemon"],
				unplugged: "Torrey"
			});
			var template = new dd.Template("{% debug %}");
			t.is('items: ["apple","banana","lemon"]\n\nunplugged: "Torrey"\n\n', template.render(context));
		},
		function test_tag_filter(t){
			var dd = dojox.dtl;

			var template = new dd.Template('{% filter lower|center:"15" %}Hot Pocket{% endfilter %}');
			t.is("  hot pocket   ", template.render());
		},
		function test_tag_firstof(t){
			t.t(false);
		},
		function test_tag_for(t){
			var dd = dojox.dtl;

			var context = new dd.Context({
				items: ["apple", "banana", "lemon"]
			});
			var template = new dd.Template("{% for item in items %}<li>{{ item }}</li>{% endfor %}");
			t.is("<li>apple</li><li>banana</li><li>lemon</li>", template.render(context));

			template = new dd.Template("{% for item in items reversed %}<li>{{ item }}</li>{% endfor %}");
			t.is("<li>lemon</li><li>banana</li><li>apple</li>", template.render(context));

			context.items = {
				apple: "Red Delicious",
				banana: "Cavendish",
				lemon: "Citrus"
			};
			template = new dd.Template("{% for key, value in items %}<li>{{ value }} {{ key|title }}</li>{% endfor %}");
			t.is("<li>Red Delicious Apple</li><li>Cavendish Banana</li><li>Citrus Lemon</li>", template.render(context));

			// The same thing above, but using "zipped" sets
			context.items = [
				["apple", "Red Delicious", 1.99],
				["banana", "Cavendish", 0.49],
				["lemon", "Citrus", 0.29]
			];
			template = new dd.Template("{% for fruit, type, price in items %}<li>{{ type }} {{ fruit|title }} costs ${{ price}}</li>{% endfor %}");
			t.is("<li>Red Delicious Apple costs $1.99</li><li>Cavendish Banana costs $0.49</li><li>Citrus Lemon costs $0.29</li>", template.render(context));

			template = new dd.Template("{% for fruit, type, price in items reversed %}<li>{{ type }} {{ fruit|title }} costs ${{ price}}</li>{% endfor %}");
			t.is("<li>Citrus Lemon costs $0.29</li><li>Cavendish Banana costs $0.49</li><li>Red Delicious Apple costs $1.99</li>", template.render(context));

			// Now to create some errors
			var found = false;
			try {
				template = new dd.Template("{% for item initems %}<li>{{ item }}</li>{% endfor %}");
			}catch(e){
				found = true;
				t.is("'for' statements should have at least four words: for item initems", e.message);
			}
			t.t(found);

			found = false;
			try {
				template = new dd.Template("{% for item ni items %}<li>{{ item }}</li>{% endfor %}");
			}catch(e){
				found = true;
				t.is("'for' tag received an invalid argument: for item ni items", e.message);
			}
			t.t(found);

			found = false;
			try {
				template = new dd.Template("{% for my item in items %}<li>{{ item }}</li>{% endfor %}");
			}catch(e){
				found = true;
				t.is("'for' tag received an invalid argument: for my item in items", e.message);
			}
			t.t(found);
		},
		function test_tag_if(t){
			t.t(false);
		},
		function test_tag_ifchanged(t){
			t.t(false);
		},
		function test_tag_ifequal(t){
			t.t(false);
		},
		function test_tag_ifnotequal(t){
			t.t(false);
		},
		function test_tag_include(t){
			t.t(false);
		},
		function test_tag_load(t){
			t.t(false);
		},
		function test_tag_now(t){
			t.t(false);
		},
		function test_tag_regroup(t){
			t.t(false);
		},
		function test_tag_spaceless(t){
			t.t(false);
		},
		function test_tag_ssi(t){
			t.t(false);
		},
		function test_tag_templatetag(t){
			t.t(false);
		},
		function test_tag_url(t){
			t.t(false);
		},
		function test_tag_widthratio(t){
			t.t(false);
		},
		function test_tag_with(t){
			t.t(false);
		}
	]
);