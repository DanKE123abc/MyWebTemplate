"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { AlertCircle, Info, Menu, Search, X } from "lucide-react";

export default function GalleryPage() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              UI Components Template Gallery
            </h1>
            <p className="text-lg text-gray-600">
              自用UI组件库
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          
          {/* Buttons Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">按钮组件</h2>
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Form Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">表单组件</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="输入邮箱地址" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="输入消息内容" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">接收通知</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">同意条款和条件</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selection Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>选择选项</Label>
                    <RadioGroup defaultValue="option1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option1" id="option1" />
                        <Label htmlFor="option1">选项 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option2" id="option2" />
                        <Label htmlFor="option2">选项 2</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>下拉选择</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择一个选项" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">选项 1</SelectItem>
                        <SelectItem value="option2">选项 2</SelectItem>
                        <SelectItem value="option3">选项 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>滑块: {sliderValue[0]}</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Display Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">展示组件</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Badges & Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <div>
                    <Label>进度条: {progressValue}%</Label>
                    <Progress value={progressValue} className="mt-2" />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                        -10
                      </Button>
                      <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                        +10
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar & Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://avatars.githubusercontent.com/u/98072464?v=4" />
                      <AvatarFallback>DK</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>JC</AvatarFallback>
                    </Avatar>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>提示</AlertTitle>
                    <AlertDescription>
                      这是一个信息提示框。
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>错误</AlertTitle>
                    <AlertDescription>
                      这是一个错误提示框。
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Layout Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">布局组件</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">标签页 1</TabsTrigger>
                      <TabsTrigger value="tab2">标签页 2</TabsTrigger>
                      <TabsTrigger value="tab3">标签页 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="mt-4">
                      <p>这是标签页 1 的内容。</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="mt-4">
                      <p>这是标签页 2 的内容。</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="mt-4">
                      <p>这是标签页 3 的内容。</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accordion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>什么是UI组件库？</AccordionTrigger>
                      <AccordionContent>
                        UI组件库是一组预构建的用户界面组件，可以在应用程序中重复使用。
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>如何使用这些组件？</AccordionTrigger>
                      <AccordionContent>
                        您可以直接导入这些组件并在您的React应用程序中使用它们。
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>是否可以自定义样式？</AccordionTrigger>
                      <AccordionContent>
                        是的，所有组件都支持通过Tailwind CSS类或自定义CSS进行样式定制。
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Interactive Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">交互组件</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dialog & Popover</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>打开对话框</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>对话框标题</DialogTitle>
                        <DialogDescription>
                          这是一个对话框的描述内容。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>对话框的主要内容在这里。</p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">打开弹出框</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">弹出框标题</h4>
                        <p className="text-sm text-gray-600">
                          这是弹出框的内容。
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tooltip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">悬停查看提示</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>这是一个工具提示</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Data Display */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">数据展示</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">张三</TableCell>
                        <TableCell>zhangsan@example.com</TableCell>
                        <TableCell>
                          <Badge variant="outline">活跃</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">李四</TableCell>
                        <TableCell>lisi@example.com</TableCell>
                        <TableCell>
                          <Badge variant="secondary">待审核</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skeleton Loading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Navigation Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">导航组件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Breadcrumb</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                      <li className="inline-flex items-center">
                        <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                          首页
                        </a>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <span className="mx-2 text-gray-400">/</span>
                          <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                            项目
                          </a>
                        </div>
                      </li>
                      <li aria-current="page">
                        <div className="flex items-center">
                          <span className="mx-2 text-gray-400">/</span>
                          <span className="text-sm font-medium text-gray-500">当前页面</span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navigation Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>开始使用</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                            <NavigationMenuLink asChild>
                              <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                                <div className="text-sm font-medium leading-none">介绍</div>
                                <p className="line-clamp-2 text-sm leading-snug text-slate-500">了解如何使用我们的组件库</p>
                              </a>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                                <div className="text-sm font-medium leading-none">安装</div>
                                <p className="line-clamp-2 text-sm leading-snug text-slate-500">如何安装和配置组件库</p>
                              </a>
                            </NavigationMenuLink>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>组件</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                            <NavigationMenuLink asChild>
                              <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                                <div className="text-sm font-medium leading-none">按钮</div>
                                <p className="line-clamp-2 text-sm leading-snug text-slate-500">按钮组件的使用方法和示例</p>
                              </a>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100">
                                <div className="text-sm font-medium leading-none">卡片</div>
                                <p className="line-clamp-2 text-sm leading-snug text-slate-500">卡片组件的使用方法和示例</p>
                              </a>
                            </NavigationMenuLink>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                          文档
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pagination</CardTitle>
                </CardHeader>
                <CardContent>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Command Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-start space-y-2">
                    <p className="text-sm text-muted-foreground">按下 <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⌘</kbd> <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">K</kbd> 打开命令菜单</p>
                    <Button
                      variant="outline"
                      className="text-sm text-muted-foreground w-full justify-between"
                      onClick={() => document.querySelector('[cmdk-dialog]')?.setAttribute('data-state', 'open')}
                    >
                      <span>搜索文档...</span>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⌘K</kbd>
                    </Button>
                  </div>
                  <CommandDialog>
                    <CommandInput placeholder="输入命令或搜索..." />
                    <CommandList>
                      <CommandEmpty>没有找到结果</CommandEmpty>
                      <CommandGroup heading="建议">
                        <CommandItem>
                          <Search className="mr-2 h-4 w-4" />
                          <span>搜索</span>
                        </CommandItem>
                        <CommandItem>
                          <span>快速导航</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </CommandDialog>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Feedback Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">高级反馈组件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Dialog</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">显示警告对话框</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作无法撤销。这将永久删除您的账户和所有相关数据。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction>继续</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hover Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link">@用户名</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>用户</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">@用户名</h4>
                          <p className="text-sm">
                            用户简介信息，这里是一些关于用户的简短描述。
                          </p>
                          <div className="flex items-center pt-2">
                            <span className="text-xs text-muted-foreground">
                              加入于 2023 年 12 月
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Context Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContextMenu>
                    <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">
                      右键点击此处
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem>
                        查看资料
                      </ContextMenuItem>
                      <ContextMenuItem>
                        复制链接
                      </ContextMenuItem>
                      <ContextMenuItem>
                        下载
                      </ContextMenuItem>
                      <ContextMenuItem className="text-red-600">
                        删除
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Drawer & Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button>打开抽屉</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>编辑个人资料</DrawerTitle>
                        <DrawerDescription>
                          在此处更新您的个人资料信息。点击保存按钮应用更改。
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 pb-0">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">姓名</Label>
                            <Input id="name" placeholder="输入您的姓名" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">电子邮箱</Label>
                            <Input id="email" placeholder="输入您的电子邮箱" />
                          </div>
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button>保存更改</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">取消</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">打开菜单</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>菜单</SheetTitle>
                          <SheetDescription>
                            这是一个抽屉菜单示例，可以从侧边滑出。
                          </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-4">
                          <div className="space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="space-y-2">
                                <h4 className="font-medium">Section {i + 1}</h4>
                                <p className="text-sm text-gray-500">
                                  这是可滚动内容区域的示例文本。
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* Advanced Layout Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">高级布局组件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aspect Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9} className="bg-slate-100 overflow-hidden rounded-md">
                    <div className="flex items-center justify-center h-full text-slate-500">
                      16:9 宽高比示例
                    </div>
                  </AspectRatio>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collapsible</CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible className="w-full">
                    <div className="flex items-center justify-between space-x-4 px-4">
                      <h4 className="text-sm font-semibold">
                        可折叠内容标题
                      </h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">展开/折叠</span>
                          <Menu className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="px-4 py-2 text-sm">
                      这是始终可见的内容。
                    </div>
                    <CollapsibleContent className="px-4 py-2 text-sm">
                      这是可折叠的内容。点击按钮可以展开或折叠此内容。
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resizable</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResizablePanelGroup direction="horizontal" className="min-h-[200px] max-w-full rounded-lg border">
                    <ResizablePanel defaultSize={50}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">左侧面板</span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">右侧面板</span>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scroll Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium leading-none">可滚动区域示例</h4>
                      <p className="text-sm">这是一个可滚动区域的示例内容。</p>
                      <p className="text-sm">当内容超出容器高度时，将显示滚动条。</p>
                      <p className="text-sm">您可以使用鼠标滚轮或触控板滚动查看更多内容。</p>
                      <p className="text-sm">这是更多的内容...</p>
                      <p className="text-sm">继续滚动查看更多。</p>
                      <p className="text-sm">这是更多的内容...</p>
                      <p className="text-sm">继续滚动查看更多。</p>
                      <p className="text-sm">这是更多的内容...</p>
                      <p className="text-sm">继续滚动查看更多。</p>
                      <p className="text-sm">这是最后一行内容。</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </section>


        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 DanKe.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
