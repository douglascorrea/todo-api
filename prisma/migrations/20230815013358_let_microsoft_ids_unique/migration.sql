/*
  Warnings:

  - A unique constraint covering the columns `[microsoftTodoId]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[microsoftTodoListId]` on the table `TodoList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Todo_microsoftTodoId_key" ON "Todo"("microsoftTodoId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoList_microsoftTodoListId_key" ON "TodoList"("microsoftTodoListId");
