Spree::HomeController.class_eval do
	 def index
      @searcher = build_searcher(params.merge(include_images: true))
      @products = @searcher.retrieve_products.offset(rand(Spree::Product.count)).limit(3)
      @taxonomies = Spree::Taxonomy.includes(root: :children)
    end
end