package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  def index2 = Action {
    Ok(views.html.index2())
  }

  def slideshow = Action {
    Ok(views.html.slideshow())
  }

}