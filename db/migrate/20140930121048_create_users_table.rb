class CreateUsersTable < ActiveRecord::Migration
  def change
    create_table :users do |table|
      table.string 'username', :limit => 25, :null => false
      table.string 'first_name', :limit => 25
      table.string 'last_name', :limit => 50
      table.string 'email', :null => false
      table.string 'picture'
      table.string 'job_position'
      table.string 'skype'
      table.string 'phone'
      table.string 'hashed_password', :limit => 65
      table.string 'salt', :limit => 65
      table.timestamps
    end
  end
end
