require 'sinatra'
require 'sinatra/activerecord'
require 'json'

set :database, 'sqlite3:./db/kanban.db'
enable :sessions
set :session_secret, 'cfbe90bbaa81bfd3eb009b8e0d87a1abdee6cf88c0ac91a61476d881634d7295'

class User < ActiveRecord::Base
end

get '*/js/:filename' do
  content_type 'application/javascript'
  send_file 'public/js/#{params[:filename]}'
end

get '/' do
  send_file 'public/index.html'
end

post '/register' do
  data = JSON.parse request.body.read
  return [200, 'ok']
end

get '/access' do
  if session[:user_id]
    user = User.find(session[:user_id])
    return [200, user.username]
  end
  return [401, 'Unauthorized']
end

post '/login' do
  data = JSON.parse request.body.read
  user = User.where(username: data['username'], hashed_password: data['password']).first 
  if !user.nil?
    session[:user_id] = user.id
    return [200, user.username]
  end
    return [401, 'Unauthorized']
end

get '/logout' do
  session.delete(:user_id)
  return [200, 'Ok']
end

not_found do
  send_file 'public/index.html'
end
