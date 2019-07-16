FROM ubuntu:18.04

RUN apt update 

RUN apt install -y vim curl git-core zsh build-essential libssl-dev

# Install Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt install apt-transport-https
RUN apt update && apt install --no-install-recommends yarn

# Dotfiles
RUN git clone https://github.com/deltaepsilon/dotfiles.git ~/dotfiles
RUN git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim

WORKDIR /root

# Install Oh My ZSH
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)" || true
RUN rm .zshrc

# Install NVM and set up Node
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION  lts/carbon
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install gsutil
RUN echo "deb http://packages.cloud.google.com/apt cloud-sdk-stretch main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN apt update && apt install -y google-cloud-sdk

# Set up dotfiles
WORKDIR /root/dotfiles
RUN ./setup.sh

WORKDIR /root
RUN sed -i 's/\/Users\/quiver/\/root/g' .zshrc

# Custom ZSH config
COPY .zshrc .append-to-zshrc
RUN sed -i 's/\r//' .append-to-zshrc
RUN cat .append-to-zshrc >> .zshrc

# Rock and Roll
WORKDIR /app

CMD [ "tail", "-f", "/dev/null" ]