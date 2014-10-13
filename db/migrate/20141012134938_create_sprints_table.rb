class CreateSprintsTable < ActiveRecord::Migration
  def change
    create_table :sprints do |table|
      table.string 'codename'
      table.string 'status' # upcoming | current | passed
      table.timestamps
    end
  end
end
