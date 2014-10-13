class CreateTicketsTable < ActiveRecord::Migration
  def change
    create_table :tickets do |table|
      table.references :assignee
      table.references :reporter
      table.references :developer
      table.references :reviewer
      table.references :tester
      table.string 'ticket_type'
      table.string 'status'
      table.string 'summary'
      table.string 'description'
      table.timestamps
    end
    add_index :tickets, 'assignee_id'
    add_index :tickets, 'reporter_id'
    add_index :tickets, 'developer_id'
    add_index :tickets, 'reviewer_id'
    add_index :tickets, 'tester_id'
  end
end
