Spree::ProductsController.class_eval do
  def contact
  end

  def about
  end
  def index
      @products = Spree::Product.all
      @taxonomies = Spree::Taxonomy.includes(root: :children)
  end
end
