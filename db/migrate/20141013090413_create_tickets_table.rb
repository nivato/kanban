class CreateTicketsTable < ActiveRecord::Migration
  def change
    create_table :tickets do |table|
      table.belongs_to :sprint
      table.references :assignee
      table.references :reporter
      table.references :developer
      table.references :reviewer
      table.references :tester
      table.integer 'ticket_type', :default => 0 # task | bug
      table.integer 'status', :default => 0 # opened | todo | inprogress | review | testing | done
      table.integer 'resolution' # resolved | fixed | wontfix | cannotreproduce | canceled | duplicate | asdesigned | notvalid
      table.string 'summary'
      table.string 'description'
      table.timestamps
    end
    add_index :tickets, 'sprint_id'
    add_index :tickets, 'assignee_id'
    add_index :tickets, 'reporter_id'
    add_index :tickets, 'developer_id'
    add_index :tickets, 'reviewer_id'
    add_index :tickets, 'tester_id'
  end
end
