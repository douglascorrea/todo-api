/*
  Warnings:

  - A unique constraint covering the columns `[userId,microsoftTodoId]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,microsoftTodoListId]` on the table `TodoList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Todo_userId_microsoftTodoId_key" ON "Todo"("userId", "microsoftTodoId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoList_userId_microsoftTodoListId_key" ON "TodoList"("userId", "microsoftTodoListId");
