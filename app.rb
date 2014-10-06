require 'sinatra'
require 'sinatra/activerecord'
require 'json'
set :database, 'sqlite3:./db/kanban.db'
Dir['./models/*.rb'].each {|file| require file}
require 'securerandom'
enable :sessions
set :session_secret, 'cfbe90bbaa81bfd3eb009b8e0d87a1abdee6cf88c0ac91a61476d881634d7295'

helpers do
  def filtered_user(user)
    {
      :id => user.id,
      :username => user.username,
      :first_name => user.first_name,
      :last_name => user.last_name,
      :email => user.email,
      :picture => user.picture,
      :job_position => user.job_position,
      :skype => user.skype,
      :phone => user.phone
    }
  end

  def model_errors(model)
    model.errors.messages.map{|field, messages| "#{field.to_s.split('_').join(' ').capitalize}: #{messages.map{|message| message.capitalize}.join('. ')}"}
  end
end

before '/api/:api' do
  if ['access', 'register', 'login'].include? params[:api]
    pass
  end
  if session[:user_id]
    unless User.exists?(session[:user_id])
      session.clear
      halt 401, {:status => :error, :messages => ['Unauthorized']}.to_json
    end
    @user = User.find(session[:user_id])
  else
    halt 401, {:status => :error, :messages => ['Unauthorized']}.to_json
  end
end

get '*/js/:filename' do
  content_type 'application/javascript'
  send_file "public/js/#{params[:filename]}"
end

get '/' do
  send_file 'public/index.html'
end

get '/api/tickets' do
  return [200, {:status => :ok, :data => []}.to_json]
end

post '/api/register' do
  data = JSON.parse request.body.read
  user = User.new(data)
  if user.save
    return [200, {:status => :ok}.to_json]
  else
    return [400, {:status => :error, :messages => model_errors(user)}.to_json]
  end
end

get '/api/access' do
  user = User.find(session[:user_id])
  return [200, {:status => :ok, :data => filtered_user(user)}.to_json]
end

post '/api/login' do
  data = JSON.parse request.body.read
  user = User.authenticate(data['username'], data['password'])
  if user
    session[:user_id] = user.id
    return [200, {:status => :ok, :data => filtered_user(user)}.to_json]
  else
    return [401, {:status => :error, :messages => ['Invalid Username and/or Password']}.to_json]
  end
end

get '/api/logout' do
  session.clear
  return [200, {:status => :ok}.to_json]
end

post '/api/upload' do
  tempfile = params[:file][:tempfile]
  filename = params[:file][:filename]
  saved_name = "#{SecureRandom.hex(5)}#{File.extname(filename)}"
  File.open("public/img/ava/#{saved_name}", 'w') do |file|
    file.write(tempfile.read)
  end
  @user.picture = saved_name
  if @user.save
    return [200, {:status => :ok, :data => @user.picture}.to_json]
  else
    return [400, {:status => :error, :messages => model_errors(@user)}.to_json]
  end
end

not_found do
  send_file 'public/index.html'
end
