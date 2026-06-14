import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: JSX.Element;
  items?: MenuItem[];
}

export interface Navbar1Props {
  logo?: {
    url: string;
    src?: string;
    alt: string;
    title: string;
    icon?: JSX.Element;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
  onLogout?: () => void;
  userRole?: string;
  rightElements?: React.ReactNode;
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "/globe.svg",
    alt: "logo",
    title: "HEA Guidance",
  },
  menu = [],
  mobileExtraLinks = [],
  auth = {
    login: { text: "Log in", url: "/login" },
    signup: { text: "Sign up", url: "/register" },
  },
  onLogout,
  userRole,
  rightElements
}: Navbar1Props) => {
  return (
    <section className="py-4 border-b z-50 sticky top-0 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto h-16 flex items-center justify-between">
        <div className="hidden lg:flex items-center w-full justify-between">
          <div className="flex items-center">
            <Link href={logo.url} className="flex items-center gap-2.5">
              {logo.icon ? logo.icon : <img src={logo.src} className="w-8 h-8" alt={logo.alt} />}
              <span className="text-2xl font-black tracking-tight">{logo.title}</span>
            </Link>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-2">
            {rightElements}
            {userRole ? (
              <Button variant="outline" className="font-semibold px-6" onClick={onLogout}>
                Log out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="font-semibold px-6">
                  <Link href={auth.login.url}>{auth.login.text}</Link>
                </Button>
                <Button asChild className="font-semibold px-6">
                  <Link href={auth.signup.url}>{auth.signup.text}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="block lg:hidden w-full">
          <div className="flex items-center justify-between pl-2">
            <Link href={logo.url} className="flex items-center gap-2.5">
              {logo.icon ? logo.icon : <img src={logo.src} className="w-8 h-8" alt={logo.alt} />}
              <span className="text-2xl font-black tracking-tight">{logo.title}</span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-2.5">
                      {logo.icon ? logo.icon : <img src={logo.src} className="w-8 h-8" alt={logo.alt} />}
                      <span className="text-xl font-black tracking-tight">
                        {logo.title}
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  {mobileExtraLinks.length > 0 && (
                    <div className="border-t py-4">
                      <div className="grid grid-cols-2 justify-start">
                        {mobileExtraLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
                            href={link.url}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {rightElements}
                    {userRole ? (
                      <Button variant="outline" onClick={onLogout}>
                        Log out
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline">
                          <Link href={auth.login.url}>{auth.login.text}</Link>
                        </Button>
                        <Button asChild>
                          <Link href={auth.signup.url}>{auth.signup.text}</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            <NavigationMenuLink asChild>
              <div>
              {item.items.map((subItem) => (
                  <Link key={subItem.title}
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                    href={subItem.url}
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-muted-foreground mt-1">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </Link>
              ))}
              </div>
            </NavigationMenuLink>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <Link
      key={item.title}
      className="group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-5 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      href={item.url}
    >
      {item.title}
    </Link>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <Link
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-muted-foreground">
                    {subItem.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} href={item.url} className="text-lg font-semibold block py-3">
      {item.title}
    </Link>
  );
};

export { Navbar1 };
